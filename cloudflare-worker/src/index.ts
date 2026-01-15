/**
 * Cloudflare Worker for secure journal sync
 * 
 * Security features:
 * - API key authentication
 * - Rate limiting per IP
 * - Request size limits
 * - CORS restrictions
 */

interface Env {
  JOURNAL_STORAGE: R2Bucket; // Keep original name for backward compatibility
  API_KEY: string; // Set this in Cloudflare dashboard: Settings > Variables > Environment Variables
  RATE_LIMIT_KV?: KVNamespace; // Optional: for rate limiting (create KV namespace in dashboard)
}

// Rate limiting configuration
const RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 10,
  MAX_REQUESTS_PER_HOUR: 100,
};

// Size limits
const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024; // 10MB per request

async function checkRateLimit(env: Env, ip: string): Promise<boolean> {
  if (!env.RATE_LIMIT_KV) return true; // Skip if KV not configured
  
  const minuteKey = `rate:${ip}:minute:${Math.floor(Date.now() / 60000)}`;
  const hourKey = `rate:${ip}:hour:${Math.floor(Date.now() / 3600000)}`;
  
  const [minuteCount, hourCount] = await Promise.all([
    env.RATE_LIMIT_KV.get(minuteKey),
    env.RATE_LIMIT_KV.get(hourKey),
  ]);
  
  const minute = parseInt(minuteCount || '0');
  const hour = parseInt(hourCount || '0');
  
  if (minute >= RATE_LIMIT.MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  
  if (hour >= RATE_LIMIT.MAX_REQUESTS_PER_HOUR) {
    return false;
  }
  
  // Increment counters
  await Promise.all([
    env.RATE_LIMIT_KV.put(minuteKey, String(minute + 1), { expirationTtl: 60 }),
    env.RATE_LIMIT_KV.put(hourKey, String(hour + 1), { expirationTtl: 3600 }),
  ]);
  
  return true;
}

function verifyApiKey(request: Request, env: Env): boolean {
  const apiKey = request.headers.get('X-API-Key');
  return apiKey === env.API_KEY;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // In production, restrict this to your app's domain
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
      'Access-Control-Max-Age': '86400',
    };
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }
    
    // Verify API key for all non-OPTIONS requests
    if (!verifyApiKey(request, env)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unauthorized: Invalid or missing API key' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Rate limiting
    const withinLimit = await checkRateLimit(env, clientIP);
    if (!withinLimit) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Rate limit exceeded. Please try again later.' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Check request size for POST/PUT
    if (request.method === 'POST' || request.method === 'PUT') {
      const contentLength = parseInt(request.headers.get('Content-Length') || '0');
      if (contentLength > MAX_PAYLOAD_SIZE) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Payload too large. Maximum size is ${MAX_PAYLOAD_SIZE / 1024 / 1024}MB` 
        }), {
          status: 413,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Handle sync endpoint
    if (url.pathname === '/api/sync') {
      const vaultId = url.searchParams.get('vaultId');
      
      if (!vaultId || !/^[a-f0-9-]{36}$/i.test(vaultId)) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid vaultId format' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const key = `vaults/${vaultId}/journal.json`; // Keep same path as old worker for compatibility
      
      // GET: Fetch encrypted data
      if (request.method === 'GET') {
        const object = await env.JOURNAL_STORAGE.get(key);
        
        if (!object) {
          return new Response(JSON.stringify({ 
            success: true, 
            data: null 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const data = await object.text();
        return new Response(JSON.stringify({ 
          success: true, 
          data 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // POST: Store encrypted data
      if (request.method === 'POST') {
        const body = await request.json() as { data: string };
        
        if (!body.data || typeof body.data !== 'string') {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Invalid data format' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        await env.JOURNAL_STORAGE.put(key, body.data);
        
        return new Response(JSON.stringify({ 
          success: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // DELETE: Remove vault data
      if (request.method === 'DELETE') {
        await env.JOURNAL_STORAGE.delete(key);
        
        return new Response(JSON.stringify({ 
          success: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Health check endpoint (no auth required)
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ 
        status: 'ok',
        timestamp: new Date().toISOString() 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Not found' 
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};

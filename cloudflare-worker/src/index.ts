export interface Env {
  JOURNAL_STORAGE: R2Bucket;
}

interface SyncRequest {
  vaultId: string;
  data: string; // encrypted JSON string
}

interface SyncResponse {
  success: boolean;
  timestamp: string;
  error?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS headers
    const corsHeaders = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // 24 hours
    });

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // POST /api/sync - Save encrypted journal data
      if (request.method === 'POST' && path === '/api/sync') {
        const body: SyncRequest = await request.json();
        
        if (!body.vaultId || !body.data) {
          const errorHeaders = new Headers(corsHeaders);
          errorHeaders.set('Content-Type', 'application/json');
          
          return new Response(
            JSON.stringify({ success: false, error: 'Missing vaultId or data' }),
            { 
              status: 400,
              headers: errorHeaders
            }
          );
        }

        // Store encrypted data in R2
        const key = `vaults/${body.vaultId}/journal.json`;
        await env.JOURNAL_STORAGE.put(key, body.data, {
          httpMetadata: {
            contentType: 'application/json',
          },
        });

        const timestamp = new Date().toISOString();
        const response: SyncResponse = {
          success: true,
          timestamp,
        };

        const postHeaders = new Headers(corsHeaders);
        postHeaders.set('Content-Type', 'application/json');
        
        return new Response(JSON.stringify(response), {
          headers: postHeaders,
        });
      }

      // GET /api/sync?vaultId=xxx - Retrieve encrypted journal data
      if (request.method === 'GET' && path === '/api/sync') {
        const vaultId = url.searchParams.get('vaultId');
        
        if (!vaultId) {
          const errorHeaders = new Headers(corsHeaders);
          errorHeaders.set('Content-Type', 'application/json');
          
          return new Response(
            JSON.stringify({ success: false, error: 'Missing vaultId parameter' }),
            { 
              status: 400,
              headers: errorHeaders
            }
          );
        }

        const key = `vaults/${vaultId}/journal.json`;
        const object = await env.JOURNAL_STORAGE.get(key);

        if (!object) {
          const emptyHeaders = new Headers(corsHeaders);
          emptyHeaders.set('Content-Type', 'application/json');
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              data: null, 
              timestamp: new Date().toISOString() 
            }),
            { 
              headers: emptyHeaders
            }
          );
        }

        const data = await object.text();
        const timestamp = object.uploaded?.toISOString() || new Date().toISOString();

        const getHeaders = new Headers(corsHeaders);
        getHeaders.set('Content-Type', 'application/json');

        return new Response(
          JSON.stringify({
            success: true,
            data,
            timestamp,
          }),
          {
            headers: getHeaders,
          }
        );
      }

      // DELETE /api/sync?vaultId=xxx - Delete vault data from R2
      if (request.method === 'DELETE' && path === '/api/sync') {
        const vaultId = url.searchParams.get('vaultId');
        
        if (!vaultId) {
          const errorHeaders = new Headers(corsHeaders);
          errorHeaders.set('Content-Type', 'application/json');
          
          return new Response(
            JSON.stringify({ success: false, error: 'Missing vaultId parameter' }),
            { 
              status: 400,
              headers: errorHeaders
            }
          );
        }

        try {
          const key = `vaults/${vaultId}/journal.json`;
          await env.JOURNAL_STORAGE.delete(key);

          const deleteHeaders = new Headers(corsHeaders);
          deleteHeaders.set('Content-Type', 'application/json');

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Vault data deleted successfully',
            }),
            {
              headers: deleteHeaders,
            }
          );
        } catch (error) {
          console.error('Delete error:', error);
          const errorHeaders = new Headers(corsHeaders);
          errorHeaders.set('Content-Type', 'application/json');
          
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            }),
            { 
              status: 500,
              headers: errorHeaders
            }
          );
        }
      }

      // 404 for unknown routes
      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders
      });
    } catch (error) {
      console.error('Error:', error);
      const errorHeaders = new Headers(corsHeaders);
      errorHeaders.set('Content-Type', 'application/json');
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }),
        { 
          status: 500,
          headers: errorHeaders
        }
      );
    }
  },
};

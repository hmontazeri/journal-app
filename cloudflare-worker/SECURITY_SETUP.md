# Cloudflare Worker Security Setup

This guide walks you through securing your Cloudflare Worker backend for the Journal app.

## Prerequisites

- Cloudflare account (free tier is sufficient)
- Wrangler CLI installed (`npm install -g wrangler`)
- Worker already deployed (`wrangler deploy` from `cloudflare-worker/` directory)

## 1. API Key Authentication

### Generate and Set API Key

1. **Generate a strong API key**:
   ```bash
   openssl rand -hex 32
   ```
   Copy the output (e.g., `a1b2c3d4e5f6...`)

2. **Add the API key to your Worker**:
   ```bash
   cd cloudflare-worker
   wrangler secret put API_KEY
   ```
   Paste your generated key when prompted

3. **Verify it's set**:
   ```bash
   wrangler secret list
   ```
   You should see `API_KEY` in the list

### Using the API Key in the App

When you first launch the Journal app, you'll be prompted to enter:
- **Backend URL**: Your Cloudflare Worker URL (e.g., `https://journal-sync.your-subdomain.workers.dev`)
- **API Key**: The key you just generated

The app stores these settings securely and uses them for all sync operations. You can change them later in Settings (⚙️ icon).

## 2. Set Up Rate Limiting (Optional but Recommended)

Rate limiting prevents abuse and protects your Worker from excessive requests.

### Create KV Namespace

1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **KV**
2. Click **Create a namespace**
3. Name it: `journal-rate-limit`
4. Copy the **Namespace ID**

### Bind KV to Your Worker

Edit `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your-namespace-id-here"  # Replace with your KV namespace ID
```

### Deploy the Update

```bash
wrangler deploy
```

### Configure Rate Limits

The default rate limits are:
- **10 requests per minute** per IP address
- **60 minute** block duration after hitting the limit

To change these, edit `src/index.ts`:

```typescript
const RATE_LIMIT_WINDOW = 60000; // 1 minute (in milliseconds)
const RATE_LIMIT_MAX_REQUESTS = 10; // Maximum requests per window
```

## 3. Additional Security Measures

### CORS Restrictions (Recommended for Production)

By default, the Worker accepts requests from any origin. To restrict to your app:

Edit `src/index.ts`, find the `handleCORS` function:

```typescript
function handleCORS(request: Request): Headers {
  const headers = new Headers({
    'Access-Control-Allow-Origin': 'tauri://localhost', // Only allow Tauri app
    // OR for web deployment:
    // 'Access-Control-Allow-Origin': 'https://your-domain.com',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    'Access-Control-Max-Age': '86400',
  });
  return headers;
}
```

### IP Whitelist (Advanced)

For personal use, you can whitelist only your IP addresses:

```typescript
const ALLOWED_IPS = ['1.2.3.4', '5.6.7.8'];

function checkIPWhitelist(request: Request): boolean {
  const clientIP = request.headers.get('CF-Connecting-IP');
  return ALLOWED_IPS.includes(clientIP || '');
}
```

### Request Size Limits

The Worker already includes request size limits (default: 1MB). Adjust in `src/index.ts`:

```typescript
const MAX_REQUEST_SIZE = 1024 * 1024; // 1MB (in bytes)
```

## 4. Monitoring & Alerts

### View Worker Logs

```bash
wrangler tail
```

Or in the Cloudflare dashboard:
- Go to **Workers & Pages** → Your Worker → **Logs**

### Set Up Alerts

1. Go to your Worker → **Settings** → **Alerts**
2. Set up notifications for:
   - High error rates
   - Unusual traffic patterns
   - Rate limit violations

## 5. Best Practices

1. **Rotate API Keys Regularly**: Change your API key every 3-6 months
   ```bash
   wrangler secret put API_KEY
   # Update the key in your Journal app Settings
   ```

2. **Monitor Usage**: Check your Cloudflare dashboard weekly for unusual activity

3. **Backup Your Data**: The Worker stores encrypted data, but you should still export backups from the app regularly

4. **Keep Worker Updated**: Pull updates from the repository and redeploy:
   ```bash
   git pull origin main
   cd cloudflare-worker
   wrangler deploy
   ```

5. **Use Strong Encryption Passwords**: The app's encryption is only as strong as your password

## Troubleshooting

### "Unauthorized" Error in App

- Verify API key is set: `wrangler secret list`
- Check that the key in Settings matches the one in Cloudflare
- Try regenerating and setting a new key

### Rate Limit Errors

- Check KV namespace is properly bound in `wrangler.toml`
- Verify KV namespace ID is correct
- Review rate limit settings in `src/index.ts`

### CORS Errors

- Check `Access-Control-Allow-Origin` in Worker code
- For Tauri apps, use `tauri://localhost`
- For web deployment, use your actual domain

## Cost Estimates

With Cloudflare's free tier:
- **100,000 requests/day**
- **10ms CPU time per request**
- **1GB R2 storage**

For personal journaling, this is more than sufficient. Typical usage:
- ~10-50 requests/day (depending on sync frequency)
- ~1-10MB storage (years of journal entries)

## Security Summary

✅ API key authentication prevents unauthorized access  
✅ Rate limiting prevents abuse  
✅ Request size limits prevent DoS attacks  
✅ Vault ID validation prevents injection  
✅ Client-side encryption ensures data privacy  
✅ You control your own backend and data  

**Remember**: Your journal data is encrypted before it ever leaves your device. Even if someone accesses your R2 bucket, they can't read your entries without your password!

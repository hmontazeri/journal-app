# Security Setup for Cloudflare Worker

Your journal sync API now includes multiple security layers to prevent abuse.

## 1. Set Up API Key

### Generate a Secure API Key

```bash
# Generate a random 32-character API key
openssl rand -base64 32
# Or use this online: https://www.uuidgenerator.net/api/guid

# Example output: dGhpc2lzYXNlY3VyZWFwaWtleWZvcmpvdXJuYWw=
```

### Add API Key to Cloudflare Worker

1. Go to your Cloudflare dashboard
2. Navigate to **Workers & Pages**
3. Click on your `journal-sync` worker
4. Go to **Settings** → **Variables**
5. Click **Add variable**
   - **Variable name**: `API_KEY`
   - **Value**: Your generated API key
   - **Type**: Secret (encrypted)
6. Click **Save**

### Add API Key to Your App

1. Open `/Users/hamedmontazeri/Documents/projects/journal/.env.local` (create if doesn't exist)
2. Add:
   ```
   VITE_API_KEY=your-api-key-here
   ```
3. **IMPORTANT**: Never commit `.env.local` to git!

Add to `.gitignore`:
```
.env.local
.env*.local
```

## 2. Set Up Rate Limiting (Optional but Recommended)

Rate limiting requires a Cloudflare KV namespace.

### Create KV Namespace

1. In Cloudflare dashboard, go to **Workers & Pages** → **KV**
2. Click **Create a namespace**
3. Name it: `journal-rate-limit`
4. Click **Add**

### Bind KV to Worker

1. Go to your `journal-sync` worker
2. Go to **Settings** → **Bindings**
3. Click **Add binding**
   - **Variable name**: `RATE_LIMIT_KV`
   - **KV namespace**: Select `journal-rate-limit`
4. Click **Save**

### Current Limits

- **10 requests per minute** per IP
- **100 requests per hour** per IP

To adjust, edit `RATE_LIMIT` in `src/index.ts`.

## 3. Monitor Costs and Usage

### Set Up Billing Alerts

1. Go to Cloudflare dashboard → **Account** → **Billing**
2. Click **Notifications**
3. Enable alerts for:
   - R2 storage exceeding threshold
   - Worker invocations exceeding threshold
   - Bandwidth usage

### Check Usage

- **R2 Storage**: Dashboard → **R2** → Your bucket → **Metrics**
- **Worker Requests**: Dashboard → **Workers & Pages** → Your worker → **Analytics**

## 4. Additional Security Measures

### Restrict CORS (Recommended for Production)

In `src/index.ts`, change:

```typescript
'Access-Control-Allow-Origin': '*',
```

To your app's domain:

```typescript
'Access-Control-Allow-Origin': 'tauri://localhost', // For Tauri apps
```

### IP Allowlist (Optional)

Add your IP addresses to a whitelist:

```typescript
const ALLOWED_IPS = ['your.ip.address.here'];

if (!ALLOWED_IPS.includes(clientIP)) {
  return new Response('Forbidden', { status: 403 });
}
```

## 5. Deploy Updated Worker

```bash
cd cloudflare-worker
npm run deploy
```

## Security Features Summary

✅ **API Key Authentication** - Only authorized apps can access
✅ **Rate Limiting** - Prevents abuse (10/min, 100/hour per IP)
✅ **Request Size Limits** - Max 10MB per request
✅ **VaultId Validation** - Only valid UUIDs accepted
✅ **Client-side Encryption** - Data is encrypted before upload
✅ **CORS Controls** - Restrict which domains can access

## Cost Protection

Even with these measures, monitor your usage:

- **Free Tier Limits**:
  - Workers: 100,000 requests/day
  - R2 Storage: 10GB free
  - R2 Operations: 1M Class A, 10M Class B per month

- **Typical Usage** (1 user, daily journaling):
  - ~10 requests/day (sync operations)
  - ~1MB storage/year
  - Well within free tier

## Troubleshooting

### API Key Not Working

1. Ensure API key is set in Cloudflare Worker settings
2. Ensure API key is set in your app's `.env.local`
3. Rebuild your app: `npm run tauri dev`

### Rate Limit Errors

If you see "Rate limit exceeded":
- Wait 1 minute or 1 hour
- Check if KV namespace is properly bound
- Increase limits in `src/index.ts` if needed

### Still Concerned?

Additional options:
1. **Use Cloudflare Access** - Add email authentication
2. **Use Cloudflare Tunnels** - Keep worker completely private
3. **Self-host** - Deploy on your own infrastructure
4. **Different backend** - Use AWS S3, Azure Blob, etc.

# Release Build Setup

This document explains how to configure automated releases with the embedded API key.

## GitHub Secret Configuration

For the release workflow to embed your API key, you need to add it as a GitHub secret:

### Step 1: Add Secret to GitHub

1. Go to your GitHub repository: https://github.com/hmontazeri/journal-app
2. Click **Settings** (top right)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add the following:
   - **Name**: `VITE_API_KEY`
   - **Value**: Your Cloudflare Worker API key (the same one you set in Cloudflare dashboard)
6. Click **Add secret**

### Step 2: Trigger a Release

```bash
# Bump version and create release
npm version patch -m "chore: release v%s"
git push origin main --tags
```

The GitHub Actions workflow will:
1. Build the app for all platforms
2. Embed your API key from the secret
3. Create a GitHub Release
4. Attach the installers

## Security Considerations

### ⚠️ Important: Understand the Trade-offs

**Embedding the API key means:**

✅ **Pros:**
- Users can download and use the app immediately
- No setup required for end users
- Works out of the box

❌ **Cons:**
- Anyone with the app can extract the API key (with effort)
- All users share the same API key
- If key is compromised, you must revoke and redeploy
- You're responsible for all API costs from all users

### 🔒 Better Approach for Public Apps

If you want to distribute this app publicly, consider:

#### Option 1: Each User Hosts Their Own Backend

**Pros**: Most secure, users control their own data and costs  
**Cons**: Requires technical knowledge to set up

**Setup**:
1. User creates their own Cloudflare account
2. User deploys the worker to their account
3. User generates their own API key
4. User builds the app with their API key

#### Option 2: Authentication Layer

**Pros**: Secure, trackable, can charge for access  
**Cons**: More complex, requires user management

**Implementation**:
- Add Cloudflare Access or similar OAuth
- Each user gets their own account
- API key is per-user, tracked in a database
- Can revoke access per user

#### Option 3: Hybrid Approach

**Pros**: Balance of security and usability  
**Cons**: Requires both backend and app changes

**Implementation**:
- Ship app without API key
- On first launch, user enters their email
- Backend generates and emails them an API key
- User enters key in app settings
- App saves key locally

## Current Implementation (Personal Use)

The current setup is designed for **personal use** or **small trusted group**:

- One shared API key for all installs
- Protected by rate limiting (10/min, 100/hour per IP)
- Protected by request size limits (10MB max)
- Monitor usage via Cloudflare dashboard

## Monitoring and Protection

### Set Up Alerts

1. Go to Cloudflare Dashboard → **Notifications**
2. Enable alerts for:
   - R2 storage exceeding threshold
   - Worker invocations exceeding threshold
   - Unusual traffic patterns

### Monitor Usage

Check regularly:
- **R2 Metrics**: Dashboard → R2 → Your bucket → Metrics
- **Worker Analytics**: Dashboard → Workers → journal-sync → Analytics

### If API Key is Compromised

1. Generate a new API key: `openssl rand -base64 32`
2. Update in Cloudflare Worker settings
3. Update GitHub secret `VITE_API_KEY`
4. Create new release: `npm version patch`
5. Notify users to update

## Cost Estimates

With the current rate limits:

- **Max requests**: 100/hour × 24 × 30 = 72,000 per user per month
- **Max storage**: Unlimited users can fill your 10GB free tier
- **Recommendation**: Monitor closely if sharing publicly

## Alternative: Make Backend Optional

Another approach is to make the cloud sync optional:

```typescript
// In sync service
const API_KEY = import.meta.env.VITE_API_KEY || '';

if (!API_KEY) {
  // Offline-only mode
  console.warn('No API key configured - running in offline mode');
  return { success: false, error: 'Offline mode' };
}
```

Users without an API key can still use the app, just without cloud sync.

## Conclusion

For **personal use** or **small group**:
- ✅ Current approach (embedded key) is fine
- ✅ Make sure to monitor usage
- ✅ Keep GitHub repo private if you're concerned

For **public distribution**:
- ❌ Don't embed a shared API key
- ✅ Require users to set up their own backend
- ✅ Or implement per-user authentication

Choose based on your use case!

# Recent Changes - Backend Configuration Update

## What Changed?

The app no longer has any hardcoded backend URLs or API keys. Instead, users configure their own backend on first launch.

## Why This Change?

### Before (Problems):
- ❌ API keys embedded in releases could be extracted
- ❌ Everyone shared the same backend infrastructure
- ❌ One API key for all users = security and cost concerns
- ❌ No control over your own data storage

### After (Solutions):
- ✅ Each user deploys their own Cloudflare Worker backend
- ✅ Each user generates their own API key
- ✅ No shared infrastructure or costs
- ✅ No API key extraction concerns (nothing hardcoded)
- ✅ Full control over your data and backend
- ✅ Truly backend-agnostic design

## User Experience Flow

### First Launch:

```
1. Download app from releases
2. Launch app
3. See "Backend Configuration" screen
4. Enter:
   - Backend URL: https://your-worker.workers.dev
   - API Key: your-generated-key
5. Click Continue
6. Create new vault or connect to existing vault
7. Start journaling!
```

### Subsequent Launches:

```
1. Launch app
2. See password unlock screen
3. Unlock and start journaling
```

Settings can be changed anytime via the ⚙️ icon in the sidebar.

## Files Changed

### Removed:
- `.env.example` - No longer needed
- `RELEASE_SETUP.md` - Outdated approach
- `test-sync.html` - Old test file
- `.github/workflows/release.yml` - Removed API key embedding step

### Modified:
- `src/types/index.ts` - Added `backendUrl` and `apiKey` to `VaultConfig`
- `src/components/VaultSetup.tsx` - Added backend configuration step
- `src/components/Settings.tsx` - Now manages backend configuration
- `src/services/sync.ts` - Reads backend config from `VaultConfig`
- `src/hooks/useVault.ts` - Stores backend config in vault
- `cloudflare-worker/SECURITY_SETUP.md` - Updated for new flow

### Added:
- `SETUP_GUIDE.md` - Comprehensive setup instructions

## Testing the Changes

### Test 1: Fresh Install

1. Build the app:
   ```bash
   npm run tauri dev
   ```

2. Delete local storage to simulate fresh install:
   - Open DevTools (if you can)
   - Or delete: `~/Library/Application Support/com.hamedmontazeri.journal/` (macOS)

3. Launch the app - you should see "Backend Configuration" screen

4. Enter your backend URL and API key

5. Create a new vault

6. Verify you can write entries and they sync

### Test 2: Settings Dialog

1. Launch the app with an existing vault

2. Click the ⚙️ icon in the sidebar

3. Verify you can see and edit:
   - Backend URL
   - API Key

4. Change the values and save

5. App should reload and use new configuration

### Test 3: Existing Vault Connection

1. Get a Vault ID from another device (or your current device)

2. On the "Backend Configuration" screen, enter backend URL/API key

3. Click Continue

4. Choose "Existing Vault"

5. Enter Vault ID and verify password

6. Entries should sync and appear

## Migration for Existing Users

If you were using the old hardcoded backend:

1. Update to the latest version
2. You'll see the backend configuration screen
3. Enter:
   - **Backend URL**: `https://journal-sync.mvlab.workers.dev` (or your URL)
   - **API Key**: Get this from the Cloudflare dashboard
4. Continue with your existing vault

## For Developers

To run in development:

```bash
# Start the dev server
npm run tauri dev

# The app will prompt for backend configuration on first launch
# Use your own Cloudflare Worker URL and API key for testing
```

## Documentation

- **Setup Guide**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Security Setup**: [cloudflare-worker/SECURITY_SETUP.md](./cloudflare-worker/SECURITY_SETUP.md)
- **README**: [README.md](./README.md)

## Questions?

- Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions
- See [cloudflare-worker/SECURITY_SETUP.md](./cloudflare-worker/SECURITY_SETUP.md) for backend deployment
- Open an issue on GitHub if you encounter problems

---

**Summary**: The app is now truly user-owned. Each person deploys their own backend, generates their own API key, and has full control over their data. No more shared infrastructure, no more embedded secrets, no more security concerns! 🎉

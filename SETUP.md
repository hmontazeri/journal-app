# Quick Setup Guide

## Step 1: Install Rust (if not already installed)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up Cloudflare Worker

1. **Install Wrangler CLI:**
```bash
cd cloudflare-worker
npm install
npm install -g wrangler
```

2. **Login to Cloudflare:**
```bash
wrangler login
```

3. **Deploy the Worker:**
```bash
npm run deploy
```

4. **Copy your Worker URL** (it will be shown after deployment, something like `journal-sync.your-username.workers.dev`)

5. **Update the sync URL** in `src/services/sync.ts`:
```typescript
const SYNC_API_URL = 'https://journal-sync.your-username.workers.dev';
```

## Step 4: Run the App

```bash
npm run tauri dev
```

## First Launch

1. **Create a new vault:**
   - Enter a password (at least 8 characters)
   - Confirm the password
   - Click "Create Vault"
   - **Save your Vault ID** - you'll need it for your second Mac!

2. **On your second Mac:**
   - Select "Existing Vault"
   - Enter the Vault ID from your first Mac
   - Enter the same password
   - Your entries will sync automatically!

## Troubleshooting

### Rust not found
- Make sure Rust is installed and in your PATH
- Run `rustc --version` to verify

### Cloudflare Worker deployment fails
- Make sure you're logged in: `wrangler whoami`
- Check that you have a Cloudflare account (free tier works)

### Sync not working
- Verify the SYNC_API_URL in `src/services/sync.ts` matches your deployed worker
- Check browser console for errors
- Make sure both Macs are using the same Vault ID and password

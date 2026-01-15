# Journal App - Complete Setup Guide

This guide covers everything you need to get started with the Journal app, from deploying your backend to creating your first entry.

## Table of Contents

1. [Quick Start for End Users](#quick-start-for-end-users)
2. [Backend Deployment](#backend-deployment)
3. [First Launch Configuration](#first-launch-configuration)
4. [Creating or Connecting to a Vault](#creating-or-connecting-to-a-vault)
5. [Using Multiple Devices](#using-multiple-devices)
6. [Troubleshooting](#troubleshooting)

## Quick Start for End Users

### 1. Download the App

- Visit the [Releases page](https://github.com/hmontazeri/journal-app/releases)
- Download the latest version for your platform:
  - **macOS**: `.dmg` file
  - **Windows**: `.msi` installer
  - **Linux**: `.AppImage` or `.deb`

### 2. Install

- **macOS**: Open the `.dmg`, drag Journal to Applications
- **Windows**: Run the `.msi` installer
- **Linux**: Make the `.AppImage` executable or install the `.deb` package

### 3. Deploy Your Backend

You'll need your own Cloudflare Worker backend (it's free!).

See [Backend Deployment](#backend-deployment) below for detailed instructions.

### 4. Launch and Configure

Open the Journal app. You'll see a welcome screen asking for:
1. **Backend URL**: Your Cloudflare Worker URL
2. **API Key**: The key you generated when deploying

That's it! The app will store these settings and you're ready to journal.

## Backend Deployment

The Journal app uses Cloudflare Workers for cloud sync. Here's how to set it up:

### Prerequisites

- Free Cloudflare account ([sign up here](https://dash.cloudflare.com/sign-up))
- Node.js installed (for Wrangler CLI)

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open your browser for authentication.

### Step 3: Clone or Download Worker Code

If you haven't already:

```bash
git clone https://github.com/hmontazeri/journal-app.git
cd journal-app/cloudflare-worker
```

### Step 4: Deploy the Worker

```bash
wrangler deploy
```

You'll see output like:

```
Published journal-sync (1.23 sec)
  https://journal-sync.your-subdomain.workers.dev
```

**Save this URL** - you'll need it for the app!

### Step 5: Generate and Set API Key

Generate a secure API key:

```bash
openssl rand -hex 32
```

Copy the output (it looks like `a1b2c3d4e5f6...`)

Set it as a Worker secret:

```bash
wrangler secret put API_KEY
```

Paste your API key when prompted.

**Save this API key** - you'll need it for the app!

### Step 6: Create R2 Bucket

```bash
wrangler r2 bucket create journal-storage
```

### Step 7: Verify Everything

Your `wrangler.toml` should look like:

```toml
name = "journal-sync"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "JOURNAL_STORAGE"
bucket_name = "journal-storage"
```

Test your deployment:

```bash
curl -X GET https://your-worker.workers.dev/sync/test-vault-id \
  -H "X-API-Key: your-api-key"
```

You should get a JSON response (likely empty for a new vault).

## First Launch Configuration

### Backend Configuration Screen

When you first launch the app, you'll see:

```
┌─────────────────────────────────────────┐
│     Welcome to Journal                   │
│                                          │
│  Configure your backend and create a     │
│  secure vault                            │
│                                          │
│  Backend Configuration                   │
│  ┌─────────────────────────────────────┐ │
│  │ Backend URL                          │ │
│  │ https://your-worker.workers.dev      │ │
│  └─────────────────────────────────────┘ │
│  Your Cloudflare Worker URL              │
│                                          │
│  ┌─────────────────────────────────────┐ │
│  │ API Key                              │ │
│  │ ●●●●●●●●●●●●●●●●●●●●                 │ │
│  └─────────────────────────────────────┘ │
│  From your Cloudflare Worker dashboard   │
│                                          │
│  [ Continue ]                            │
└─────────────────────────────────────────┘
```

**What to enter**:
1. **Backend URL**: The URL from Step 4 of Backend Deployment
2. **API Key**: The API key you generated in Step 5

Click **Continue** when ready.

## Creating or Connecting to a Vault

After configuring your backend, you'll see two options:

### Option 1: New Vault (First Time)

Use this if this is your first time using the app.

1. Click **New Vault**
2. Enter a password (minimum 8 characters)
3. Confirm your password
4. Click **Create Vault**

**Important**: Write down or save your password securely! There's no way to recover it if you forget.

The app will show you your **Vault ID**. This is important for syncing across devices!

### Option 2: Existing Vault (Syncing Another Device)

Use this if you've already created a vault on another device.

1. Click **Existing Vault**
2. Enter your **Vault ID** (get this from your other device)
3. Click **Check Vault**
4. Enter your password
5. Click **Verify & Connect**

The app will download and decrypt your journal entries.

## Using Multiple Devices

To use Journal on multiple devices:

### On Your First Device

1. Set up the app as described above
2. Go to Settings (⚙️ icon in sidebar) or User Info (👤 icon)
3. Copy your **Vault ID**
4. Save it somewhere secure (password manager, encrypted note, etc.)

### On Your Second Device

1. Install the app
2. Configure the same Backend URL and API Key
3. Choose **Existing Vault**
4. Enter your Vault ID and password

Both devices will now sync to the same vault!

### Syncing Behavior

- **Auto-sync**: The app syncs automatically after you stop typing (3-second delay)
- **Offline mode**: You can write offline; entries sync when you're back online
- **Conflict resolution**: Latest write wins (entries are timestamped)

## Changing Settings

After initial setup, you can change your backend configuration:

1. Click the ⚙️ icon in the sidebar
2. Update Backend URL or API Key
3. Click **Save Settings**
4. The app will reload

## Troubleshooting

### "Invalid URL format" Error

- Make sure your Backend URL starts with `https://`
- Don't include `/sync/` or any path - just the base URL
- Example: `https://journal-sync.worker.workers.dev`

### "Unauthorized" or "Invalid API key" Error

- Verify your API key is set in Cloudflare: `wrangler secret list`
- Make sure you copied the full key (no extra spaces)
- Try regenerating a new key:
  ```bash
  openssl rand -hex 32
  wrangler secret put API_KEY
  # Update in Settings dialog
  ```

### "Vault not found" Error

- Double-check your Vault ID (it's a UUID like `a1b2c3d4-...`)
- Make sure you configured the same Backend URL as your other device
- Verify your other device has synced at least once

### "Rate limit exceeded" Error

- You're making too many requests too quickly
- Wait 1 minute and try again
- If it persists, check Cloudflare Worker logs

### Journal Entries Not Syncing

1. Check your internet connection
2. Verify Backend URL and API Key in Settings
3. Look at the sync status indicator (top right)
4. Try manually forcing a sync by editing an entry

### Password Verification Failed

- Make sure you're entering the exact password (case-sensitive)
- Check you haven't confused similar characters (0/O, l/1, etc.)
- If you've forgotten your password, there's no recovery option

## Security Best Practices

1. **Use a Strong Password**: At least 12 characters, mix of letters/numbers/symbols
2. **Store Vault ID Securely**: Use a password manager
3. **Rotate API Keys**: Change every 3-6 months
4. **Don't Share Your Backend**: Each person should deploy their own
5. **Enable Rate Limiting**: See [Security Setup](./cloudflare-worker/SECURITY_SETUP.md)

## Support

- **Documentation**: [README.md](./README.md)
- **Security**: [Security Setup](./cloudflare-worker/SECURITY_SETUP.md)
- **Issues**: [GitHub Issues](https://github.com/hmontazeri/journal-app/issues)

## Next Steps

Now that you're set up:

1. **Write your first entry**: Click today's date, start typing!
2. **Explore features**:
   - Mood tracking (1-10 scale)
   - Tags for organization
   - Rich text formatting
   - Energy tracking (what drained/gave you energy)
3. **Check Insights**: Click "Insights" to see statistics
4. **Browse History**: Click the calendar icon to browse past entries

Happy journaling! 📝

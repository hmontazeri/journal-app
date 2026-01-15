# Journal

A beautiful, minimalist journaling app built with Tauri 2.0. Your thoughts, encrypted and synced to your own cloud backend.

## ✨ Features

- **End-to-End Encryption**: AES-256-GCM encryption with PBKDF2 key derivation
- **Rich Text Editor**: Beautiful WYSIWYG editor with markdown support
- **Mood & Energy Tracking**: Track your emotional state and energy levels
- **Tags & Organization**: Organize entries with custom tags
- **Cloud Sync**: Sync to your own Cloudflare Worker backend
- **Cross-Platform**: Works on macOS, Windows, and Linux
- **Offline First**: Write anytime, sync when online
- **Dark Mode**: Automatic system-based theme switching

## 🚀 Quick Start

### For End Users

1. **Download the latest release** from the [Releases page](https://github.com/hmontazeri/journal-app/releases)
2. **Install** the app for your platform
3. **Set up your backend**:
   - Deploy the Cloudflare Worker (see [Backend Setup](#backend-setup))
   - Or use an existing backend if shared with you
4. **Launch the app** and enter your backend URL and API key
5. **Create a new vault** or connect to an existing one

### For Developers

```bash
# Clone the repository
git clone https://github.com/hmontazeri/journal-app.git
cd journal-app

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## 🔐 Backend Setup

This app requires a cloud backend for syncing. We recommend using Cloudflare Workers (free tier available).

### Deploy Cloudflare Worker

1. **Sign up** for [Cloudflare](https://cloudflare.com) (free tier is sufficient)
2. **Install Wrangler CLI**:
   ```bash
   npm install -g wrangler
   wrangler login
   ```
3. **Deploy the worker**:
   ```bash
   cd cloudflare-worker
   wrangler deploy
   ```
4. **Configure security** (important!):
   - Set an API key: `wrangler secret put API_KEY`
   - Optionally set up rate limiting (see [Security Setup](./cloudflare-worker/SECURITY_SETUP.md))
5. **Copy your worker URL** (e.g., `https://journal-sync.your-subdomain.workers.dev`)

### Use in the App

When you first launch the app, you'll be prompted to enter:
- **Backend URL**: Your Cloudflare Worker URL
- **API Key**: The API key you set in step 4

These settings can be changed later in the Settings dialog (⚙️ icon in sidebar).

## 📖 Documentation

- [Cloudflare Worker Security Setup](./cloudflare-worker/SECURITY_SETUP.md)
- [Version Management](./VERSIONING.md)
- [Automation Guide](./AUTOMATION.md)

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Tauri 2.0 (Rust)
- **Editor**: TipTap
- **Cloud**: Cloudflare Workers + R2
- **Encryption**: Web Crypto API (AES-256-GCM, PBKDF2)

## 📝 License

MIT

## 🙏 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔒 Security

- All journal data is encrypted client-side before leaving your device
- Your password never leaves your device
- Encryption keys are derived from your password using PBKDF2 (100,000 iterations)
- Data is stored in Cloudflare R2 as encrypted blobs
- You control your own backend and API keys

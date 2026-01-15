# Journal

A beautiful, minimalist journaling app built with Tauri 2.0. Your thoughts, encrypted and synced to your own cloud backend.

## ✨ Features

- **Privacy First**: Works 100% locally - no account, no tracking, no cloud required
- **Optional Cloud Sync**: Enable syncing to your own backend when you need it
- **End-to-End Encryption**: AES-256-GCM encryption with PBKDF2 key derivation
- **Rich Text Editor**: Beautiful WYSIWYG editor with markdown support
- **Mood & Energy Tracking**: Track your emotional state and energy levels
- **Tags & Organization**: Organize entries with custom tags
- **Cross-Platform**: Works on macOS, Windows, and Linux
- **Offline First**: Write anytime, sync when online
- **Dark Mode**: Automatic system-based theme switching

## 🚀 Quick Start

### For End Users

1. **Download the latest release** from the [Releases page](https://github.com/hmontazeri/journal-app/releases)
2. **Install** the app for your platform
3. **Launch the app**
4. **Choose your mode**:
   - **Local Only**: Skip cloud sync, start journaling immediately (recommended for privacy)
   - **Cloud Sync**: Set up backend for multi-device access (optional)
5. **Create your vault** with a secure password
6. **Start journaling!**

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

## 🔐 Cloud Sync (Optional)

By default, the app works 100% locally on your device. If you want to sync across multiple devices, you can optionally set up cloud sync.

### Option 1: Skip Cloud Sync (Recommended for Privacy)

- Click **"Skip (Local Only)"** when launching the app
- Your journal stays on your device only
- Maximum privacy - no data ever leaves your computer
- You can enable cloud sync later in Settings if needed

### Option 2: Enable Cloud Sync

Deploy your own Cloudflare Worker backend (free tier available):

1. **Sign up** for [Cloudflare](https://cloudflare.com)
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
4. **Configure security**:
   - Generate API key: `openssl rand -hex 32`
   - Set it: `wrangler secret put API_KEY`
5. **In the app**: Enter your worker URL and API key

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

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

# Release Notes - v0.1.4

## 🎉 Major Features

### Optional Cloud Sync
- **Local-Only Mode**: Start journaling immediately with no setup required
- **Cloud Sync Mode**: Enable multi-device sync when you need it
- **Switch Anytime**: Toggle cloud sync on/off in Settings

### Privacy First
- ✅ Works 100% offline by default
- ✅ No network requests in local-only mode
- ✅ Maximum privacy without sacrificing features
- ✅ Cloud sync still end-to-end encrypted when enabled

### User-Controlled Backend
- ❌ No hardcoded backend URLs
- ❌ No hardcoded API keys
- ✅ Each user deploys their own Cloudflare Worker
- ✅ Complete control over your data

## 🔥 What's New

### Easy Onboarding
```
Download → Click "Skip (Local Only)" → Start Journaling
Total time: 10 seconds
```

### Cloud Sync (Optional)
```
Download → Deploy Backend → Enter URL + API Key → Multi-Device Sync
Total time: ~10 minutes (one-time setup)
```

### Flexible Configuration
- Settings dialog (⚙️) to enable/disable cloud sync anytime
- All local entries automatically sync when cloud is enabled
- Disable cloud sync to go back to local-only mode

## 🧹 Improvements

### Code Cleanup
- Removed 40+ debug `console.log()` statements
- Removed unused documentation files
- Removed unused assets (vite.svg, tauri.svg, react.svg)
- Updated app title and branding
- Production-ready codebase

### Performance
- Smaller bundle size
- Faster execution
- Cleaner console output
- Only error messages logged

## 📖 Documentation

- **README.md** - Quick start guide
- **SETUP_GUIDE.md** - Comprehensive setup instructions
- **OPTIONAL_CLOUD_SYNC.md** - Deep dive into local vs cloud modes
- **FINAL_SUMMARY.md** - Complete feature overview
- **CLEANUP_SUMMARY.md** - Code cleanup details

## 🔒 Security

### Local-Only Mode
- Zero network activity
- Maximum privacy
- No server logs
- No IP addresses recorded
- Complete anonymity

### Cloud Sync Mode
- End-to-end encryption (AES-256-GCM)
- PBKDF2 key derivation (100,000 iterations)
- Server only sees encrypted blobs
- Can't read entries without password
- User-deployed backend = user control

## 📦 What's Included

### Platforms
- **macOS**: Universal binary (ARM64 + x86_64)
- **Windows**: x64 installer (.msi)
- **Linux**: x64 (.AppImage, .deb)

### Features
- Rich text editor with WYSIWYG formatting
- Mood tracking (1-10 scale)
- Energy tracking (what drained/gave you energy)
- Tag system for organization
- Calendar/history navigation
- Insights and statistics
- Dark mode (system-based)
- Offline-first architecture

## 🚀 Quick Start

### Local Only (Recommended)
1. Download the installer for your platform
2. Install and launch the app
3. Click **"Skip (Local Only)"**
4. Create a password
5. Start journaling!

### With Cloud Sync
1. Deploy Cloudflare Worker ([instructions](https://github.com/hmontazeri/journal-app/blob/main/SETUP_GUIDE.md))
2. Launch the app
3. Enter your backend URL and API key
4. Create a password
5. Journal and sync across devices!

## 📝 Full Changelog

### Features
- feat: make cloud sync completely optional (#commit b83dce9)
- feat: remove hardcoded backend URLs and API keys (#commit 6df48be)
- feat: add Settings dialog for user-provided API keys (#commit 5c46158)
- feat: embed API key in release builds via GitHub secrets (#commit 4e684c4)

### Improvements
- chore: clean up unused code and debug logging (#commit 9ea7354)
- docs: add comprehensive optional cloud sync documentation (#commit aa29807)
- docs: add final summary of optional cloud sync implementation (#commit 8c81d86)
- docs: add cleanup summary (#commit b29fe0c)

### Bug Fixes
- fix: journal entries disappearing after logout/login (#previous releases)
- fix: version sync issues in CI/CD (#previous releases)
- fix: Windows MSI build failing with icon format error (#previous releases)

## 🙏 Acknowledgments

Built with:
- [Tauri 2.0](https://tauri.app/) - App framework
- [React](https://react.dev/) - UI framework
- [TipTap](https://tiptap.dev/) - Rich text editor
- [Cloudflare Workers](https://workers.cloudflare.com/) - Cloud sync backend
- [Cloudflare R2](https://www.cloudflare.com/products/r2/) - Storage

## 📄 License

MIT

---

**Enjoy your new private, flexible journaling experience!** 📝✨

For support, visit: https://github.com/hmontazeri/journal-app/issues

# Journal

A beautiful minimalist daily journaling app for macOS, built with Tauri 2.0.

## Features

- **Rich Text Editor** - Write with a WYSIWYG editor powered by TipTap
- **Mood Tracking** - Track your mood on a scale of 1-10
- **Tags** - Organize entries with tags
- **Date Navigation** - Easily browse your journal history
- **🔒 Secure Cloud Sync** - Client-side AES-256-GCM encryption with Cloudflare Workers + R2
- **Offline First** - Works offline, syncs when online
- **Beautiful Design** - Minimalist UI with elegant font pairing and dark mode support
- **Cross-Device** - Sync between multiple Macs securely

## Quick Start

### For Users

1. Download the latest release from [GitHub Releases](https://github.com/hmontazeri/journal-app/releases)
2. Install the app
3. On first launch, create a new vault or connect to an existing one
4. Start journaling!

### For Developers

```bash
# Install dependencies
npm install

# Start development server
npm run tauri dev

# Build for production
npm run tauri build
```

## Security & Cloud Sync Setup

⚠️ **IMPORTANT**: Before deploying, you must set up security to prevent API abuse.

### 1. Generate an API Key

```bash
# Generate a secure API key
openssl rand -base64 32
```

### 2. Set Up Cloudflare Worker

See detailed instructions in [`cloudflare-worker/SECURITY_SETUP.md`](./cloudflare-worker/SECURITY_SETUP.md)

Quick steps:
1. Create API key and add to Cloudflare Worker environment variables
2. (Optional) Set up KV namespace for rate limiting
3. Deploy worker: `cd cloudflare-worker && npm run deploy`

### 3. Configure Your App

```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local and add your API key
VITE_API_KEY=your-api-key-here
```

**Never commit `.env.local` to git!**

## Architecture

- **Frontend**: React + TypeScript
- **Backend**: Tauri 2.0 (Rust)
- **Cloud Sync**: Cloudflare Workers + R2
- **Encryption**: Client-side AES-256-GCM, PBKDF2 key derivation
- **Storage**: Local file system (macOS app data directory)

## Security Features

✅ **End-to-End Encryption** - Data is encrypted on your device before upload  
✅ **API Key Authentication** - Only authorized apps can access your cloud storage  
✅ **Rate Limiting** - Prevents abuse (10 requests/min, 100 requests/hour)  
✅ **Request Size Limits** - Maximum 10MB per request  
✅ **VaultId Validation** - Only valid UUIDs accepted  
✅ **Zero-Knowledge** - Server never sees your unencrypted data  

## Development

### Version Management

See [VERSIONING.md](./VERSIONING.md) for details on the automated version management system.

Quick version bump:

```bash
# Bump version and create tag
npm version patch -m "chore: release v%s"

# Push to trigger release build
git push origin main --tags
```

### Code Quality

The project uses automated linting and type checking:

- **Pre-commit hook** - TypeScript type checking before each commit
- **Pre-push hook** - Version sync verification before push
- **GitHub Actions CI** - Automated testing on every push

### Release Process

1. Update version: `npm version patch/minor/major`
2. Push with tags: `git push origin main --tags`
3. GitHub Actions automatically builds and publishes releases for all platforms

## Project Structure

```
journal/
├── src/                      # React frontend
│   ├── components/          # UI components
│   ├── hooks/               # React hooks
│   ├── services/            # API services
│   └── utils/               # Utility functions
├── src-tauri/               # Tauri backend
│   ├── src/                 # Rust code
│   ├── icons/               # App icons
│   └── capabilities/        # Tauri permissions
├── cloudflare-worker/       # Sync API
│   └── src/                 # Worker code
├── scripts/                 # Build scripts
└── docs/                    # GitHub Pages landing page
```

## Documentation

- [VERSIONING.md](./VERSIONING.md) - Version management workflow
- [AUTOMATION.md](./AUTOMATION.md) - Development automation
- [cloudflare-worker/SECURITY_SETUP.md](./cloudflare-worker/SECURITY_SETUP.md) - Security configuration
- [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - Initial setup guide

## Cost Estimates

Using Cloudflare's free tier:

- **Workers**: 100,000 requests/day (free)
- **R2 Storage**: 10GB (free)
- **R2 Operations**: 1M Class A, 10M Class B per month (free)

**Typical Usage** (1 user, daily journaling):
- ~10 requests/day (sync operations)
- ~1MB storage/year
- **Cost: $0/month** (well within free tier)

## Troubleshooting

### API Key Errors

If you see "Unauthorized" errors:
1. Ensure API key is set in Cloudflare Worker settings
2. Ensure API key is set in your app's `.env.local`
3. Rebuild your app: `npm run tauri dev`

### Rate Limit Errors

If you see "Rate limit exceeded":
- Wait 1 minute or 1 hour (depending on the limit)
- Check if KV namespace is properly bound to your worker
- Adjust limits in `cloudflare-worker/src/index.ts` if needed

### Data Not Syncing

1. Check your internet connection
2. Open Developer Tools (View → Developer → Toggle Developer Tools)
3. Look for sync errors in the Console tab
4. Verify your API key is configured correctly

## Privacy

- Your journal data is encrypted on your device before upload
- The server only stores encrypted data
- Only you have the encryption key (your password)
- We cannot read your journal entries
- No analytics or tracking

## License

Private project by Hamed Montazeri

## Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/hmontazeri/journal-app/issues)
- Check existing documentation in this repository

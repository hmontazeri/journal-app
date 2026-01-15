# Journal

A beautiful minimalist daily journaling app for macOS, built with Tauri 2.0.

## Features

- **Rich Text Editor** - Write with a WYSIWYG editor powered by TipTap
- **Mood Tracking** - Track your mood on a scale of 1-10
- **Tags** - Organize entries with tags
- **Date Navigation** - Easily browse your journal history
- **Secure Cloud Sync** - Client-side AES-256-GCM encryption with Cloudflare Workers + R2
- **Offline First** - Works offline, syncs when online
- **Beautiful Design** - Minimalist UI with elegant font pairing and dark mode support
- **Cross-Device** - Sync between multiple Macs securely

## Development

### Prerequisites

- Node.js 20+
- Rust (latest stable)
- Xcode Command Line Tools (macOS)

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run tauri dev
```

### Building

```bash
# Build for production
npm run tauri build
```

## Cloudflare Worker Setup

The app uses Cloudflare Workers + R2 for secure cloud sync:

```bash
# Deploy worker
npm run worker:deploy
```

See `cloudflare-worker/README.md` for detailed setup instructions.

## Version Management

See [VERSIONING.md](./VERSIONING.md) for details on the automated version management system.

Quick version bump:

```bash
# Bump version and create tag
npm version patch -m "chore: release v%s"

# Push to trigger release build
git push origin main --tags
```

## Code Quality

The project uses automated linting and type checking:

- **Pre-commit hook** - TypeScript type checking before each commit
- **Pre-push hook** - Version sync verification before push
- **GitHub Actions CI** - Automated testing on every push

## Release Process

1. Update version: `npm version patch/minor/major`
2. Push with tags: `git push origin main --tags`
3. GitHub Actions automatically builds and publishes releases for all platforms

## Architecture

- **Frontend**: React + TypeScript
- **Backend**: Tauri 2.0 (Rust)
- **Cloud Sync**: Cloudflare Workers + R2
- **Encryption**: Client-side AES-256-GCM, PBKDF2 key derivation
- **Storage**: Local file system (macOS app data directory)

## License

Private project by Hamed Montazeri

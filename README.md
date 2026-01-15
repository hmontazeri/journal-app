# Journal - A Beautiful Minimalist Mac Journaling App

A beautiful, minimalist Mac journaling app built with Tauri 2.0, React, and TypeScript. Features encrypted cloud sync via Cloudflare Workers.

## Features

- ✨ **Beautiful Minimalist UI** - Clean, distraction-free interface
- 📝 **WYSIWYG Editor** - Rich text editing with TipTap
- 😊 **Mood Tracking** - Scale (1-10) and emoji selection
- 🏷️ **Tags** - Organize entries with tags
- 🔒 **End-to-End Encryption** - AES-256-GCM encryption with PBKDF2 key derivation
- ☁️ **Cloud Sync** - Sync across multiple Macs via Cloudflare Workers + R2
- 📅 **Date Navigation** - Navigate between days seamlessly
- 🎯 **Auto-Scroll** - Automatically opens today's entry

## Prerequisites

- **Rust** - [Install Rust](https://www.rust-lang.org/tools/install)
- **Node.js** - v18 or higher
- **Cloudflare Account** - For deploying the Worker (free tier is sufficient)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Cloudflare Worker

1. Install Wrangler CLI globally (if not already installed):
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
cd cloudflare-worker
npm install
wrangler login
```

3. Deploy the worker:
```bash
npm run deploy
```

4. Update the sync URL in `src/services/sync.ts`:
```typescript
const SYNC_API_URL = 'https://your-worker.your-subdomain.workers.dev';
```

### 3. Run Development Server

```bash
npm run tauri dev
```

### 4. Build for Production

```bash
npm run tauri build
```

## Project Structure

```
journal/
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API and storage services
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── src-tauri/              # Tauri backend (Rust)
├── cloudflare-worker/      # Cloudflare Worker API
└── app.md                  # Planning document
```

## Security

- All journal data is encrypted client-side using AES-256-GCM
- Encryption key is derived from user password using PBKDF2 (100,000 iterations)
- Cloudflare Worker only stores encrypted blobs (never sees plaintext)
- Vault ID stored encrypted in local storage

## Development

### Adding New Features

1. Update `app.md` with your feature plan
2. Create components in `src/components/`
3. Add hooks in `src/hooks/` if needed
4. Update types in `src/types/`

### Testing Sync

1. Create a vault on first Mac
2. Note the Vault ID (shown after creation)
3. On second Mac, select "Existing Vault" and enter the Vault ID
4. Enter the same password
5. Your entries should sync automatically

## License

MIT

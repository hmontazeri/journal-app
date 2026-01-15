# Journal App - Planning Document

## Overview
A beautiful, minimalist Mac journaling app built with Tauri 2.0 for daily personal reflection and mood tracking.

## Core Requirements

### Technology Stack
- **Framework**: Tauri 2.0
- **Platform**: macOS (primary)
- **Design**: Minimalist, beautiful, native-feeling Mac app

### Core Features

#### 1. Journal Entry Structure
- **Title**: Required field for each entry
- **Free Text**: WYSIWYG rich text editor for journal content
- **Date**: Auto-assigned to entry date (not editable - one entry per day)
- **Tags**: Multiple tags per entry
- **Mood**: Mood tracking with both scale (1-10) AND emoji selection

#### 2. Date Navigation & Auto-Scroll
- **Default View**: Opens to today's journal entry
- **Auto-Scroll**: If app loads/reappears and it's a new day, automatically scroll to new entry
- **Endless Scroll**: Navigate between days seamlessly (previous/next day navigation)
- **Calendar View**: Quick date picker to jump to specific dates?

#### 3. Backup & Sync
- **Multi-Device Support**: Work seamlessly across 2 Macs (cross-account support)
- **Encrypted Storage**: Maximum security for journal data
- **Sync Method**: **Cloudflare Workers** - Custom API endpoint with R2 storage
- **Vault Setup**: On first launch, create password-protected vault with unique vault ID
- **Password Protection**: User sets password, used to derive encryption key (PBKDF2)
- **Offline-First**: Work offline, sync when online
- **Sync Trigger**: After user stops typing and goes idle for 2-3 seconds

## Enhancement Ideas

### User Experience
1. **Search Functionality**
   - Full-text search across all entries
   - Search by tags
   - Search by mood
   - Search by date range

2. **Statistics & Insights**
   - Mood trends over time (charts/graphs)
   - Most used tags
   - Journaling streak counter
   - Word count per entry / total
   - Entry frequency calendar heatmap

3. **Rich Text Features**
   - Markdown support?
   - Basic formatting (bold, italic, lists)
   - Image attachments (encrypted storage)
   - Links

4. **Templates**
   - Daily prompts/questions
   - Gratitude journal template
   - Reflection templates
   - Custom templates

5. **Export Options**
   - Export to PDF
   - Export to Markdown
   - Export to JSON (for backup)
   - Print support

6. **Privacy & Security**
   - Local encryption before sync
   - Biometric unlock (Touch ID / Face ID)
   - Auto-lock after inactivity
   - Optional passcode

7. **Notifications & Reminders**
   - Daily journaling reminders
   - Customizable reminder times
   - Gentle nudges if streak is at risk

8. **Visual Enhancements**
   - Dark mode support
   - Custom themes
   - Font customization
   - Minimalist animations/transitions

9. **Entry Management**
   - Entry templates
   - Duplicate entry
   - Archive old entries
   - Trash/deleted entries recovery

10. **Advanced Features**
    - Voice-to-text entry
    - Quick entry widget (menu bar?)
    - Keyboard shortcuts
    - Command palette (Cmd+K)

## Technical Considerations

### Backup/Sync - Cloudflare Workers ✅ (PRIMARY - Cross-Account Support)

**Cloudflare Workers + R2** - Custom API endpoint with object storage, works across different iCloud accounts!

#### Architecture
- **Workers**: Serverless functions to handle API requests (GET/POST)
- **R2**: Object storage for encrypted journal data (very cheap, free tier available)
- **Custom Domain**: Deploy to `your-worker.your-subdomain.workers.dev` or custom domain
- **Free Tier**: 
  - Workers: 100,000 requests/day free
  - R2: 10GB storage free, 1M Class A operations/month free
  - More than enough for personal journaling!

#### First-Time Setup Flow

**On First Mac:**
1. **App Launch (First Time)**
   - Detect if vault exists (check local storage for vault ID)
   - If no vault: Show onboarding screen
   
2. **Vault Creation**
   - User sets a **password** (for local encryption key derivation)
   - App generates a **unique Vault ID** (UUID v4): `ea7db147-6542-41e1-9fd3-9f1611120265`
   - Store Vault ID locally (encrypted with password-derived key)
   - Test connection by creating a test entry
   - Show Vault ID to user (for setup on second Mac)
   
3. **Password Protection**
   - Derive encryption key from user password using PBKDF2 (100k iterations)
   - Encrypt Vault ID before storing locally
   - Require password on app launch (optional: biometric unlock via macOS Keychain)
   - All journal data encrypted with password-derived key before upload

**On Second Mac:**
4. **Multi-Device Setup**
   - User enters Vault ID (from first Mac's settings/export)
   - User enters same password
   - App derives same encryption key from password
   - App decrypts and uses Vault ID to access same vault
   - Sync automatically works!

#### Implementation Strategy

**Cloudflare Worker API Endpoints:**
```
POST /api/sync
  Body: { vaultId: string, data: string (encrypted JSON) }
  Response: { success: boolean, timestamp: string }

GET /api/sync?vaultId={vaultId}
  Response: { data: string (encrypted JSON), timestamp: string }
```

**Data Storage Structure (in R2):**
- **Key**: `vaults/{vaultId}/journal.json`
- **Value**: Encrypted JSON string containing all entries

```json
// Encrypted blob stored in R2
{
  "entries": {
    "2024-01-15": {
      "id": "uuid",
      "date": "2024-01-15",
      "title": "Encrypted title",
      "content": "Encrypted WYSIWYG HTML",
      "tags": ["encrypted", "array"],
      "mood": {
        "scale": 8,
        "emoji": "😊"
      },
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    },
    "2024-01-16": { ... }
  },
  "metadata": {
    "lastSync": "timestamp",
    "version": "1.0",
    "deviceId": "mac-1-uuid"
  }
}
```

**Sync Flow (After Idle):**
1. User types → debounce timer starts (2-3 seconds)
2. User stops typing → timer expires
3. Encrypt all journal data with password-derived key (AES-256-GCM)
4. POST encrypted data to Cloudflare Worker: `POST /api/sync`
5. Worker stores encrypted blob in R2: `vaults/{vaultId}/journal.json`
6. Store sync timestamp locally
7. Show sync status indicator

**Retrieve Flow (On App Launch):**
1. User enters password (or biometric unlock)
2. Derive encryption key from password
3. GET from Cloudflare Worker: `GET /api/sync?vaultId={vaultId}`
4. Worker retrieves encrypted blob from R2
5. Decrypt data with password-derived key
6. Merge with local data (conflict resolution: newer timestamp wins)
7. Update local storage and UI

**Periodic Sync (Background):**
- Check for updates every 30-60 seconds when app is active
- Compare local `lastSync` timestamp with remote
- If remote is newer, fetch and merge updates

**Security:**
- ✅ Password-derived encryption key (PBKDF2, 100k iterations)
- ✅ AES-256-GCM encryption for all data
- ✅ Vault ID stored encrypted locally (in macOS Keychain)
- ✅ No plaintext data ever sent to Worker
- ✅ Password never stored, only used for key derivation
- ✅ Optional biometric unlock (Touch ID) for password entry
- ✅ Worker only stores/retrieves encrypted blobs (no decryption on server)

**Advantages:**
- ✅ **Cross-account support** - Works on any Mac with internet
- ✅ Very cheap (essentially free for personal use)
- ✅ Full control over API and storage
- ✅ Fast (Cloudflare's global network)
- ✅ Simple setup (just Vault ID + password)
- ✅ Works offline (syncs when online)
- ✅ Maximum security (client-side encryption, server never sees plaintext)

**Deployment:**
- Worker code in `cloudflare-worker/` directory
- Deploy with `wrangler deploy`
- R2 bucket created automatically via wrangler.toml
- No server management needed!

### Encryption Strategy
- Use **AES-256-GCM** for symmetric encryption
- Encrypt entire entry JSON before upload
- Store encryption key locally (or derive from user password)
- Never send unencrypted data to server

### Data Structure
```json
{
  "id": "uuid",
  "date": "2024-01-15",
  "title": "Entry title",
  "content": "WYSIWYG HTML content (encrypted)",
  "tags": ["tag1", "tag2"],
  "mood": {
    "scale": 8,
    "emoji": "😊"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "encrypted": true
}
```

### Sync Implementation
- **Trigger**: Debounced sync after 2-3 seconds of user inactivity (no typing)
- **Location**: iCloud Drive directory (auto-syncs across Macs)
- **Format**: Single encrypted JSON file per entry: `YYYY-MM-DD.encrypted.json`
- **Conflict Resolution**: Last-write-wins with timestamp comparison

## Decisions Made ✅

1. **Mood Tracking**: ✅ Scale (1-10) AND emoji selection (both)
2. **Text Editor**: ✅ WYSIWYG rich text editor
3. **Date Editing**: ✅ No - one entry per day, dates not editable
4. **UI Framework**: ✅ React or Vue (developer choice)
5. **Sync Frequency**: ✅ Sync after user stops typing and goes idle for 2-3 seconds
6. **Backup API**: ✅ **Cloudflare Workers** - Custom API with R2 storage, **cross-account support**
7. **Vault Setup**: ✅ Password-protected vault created on first launch with unique vault ID

## Remaining Questions

1. **Tags**
   - Auto-complete from existing tags?
   - Tag suggestions?
   - Tag colors/categories?

2. **Offline Behavior**
   - How long can user work offline?
   - Conflict resolution strategy? (if both Macs edit same entry)

3. **Minimum macOS Version**
   - macOS 11 (Big Sur)?
   - macOS 12 (Monterey)?
   - macOS 13+ (Ventura)?

4. **Initial Launch**
   - Onboarding flow?
   - Tutorial/walkthrough?
   - Import from other journal apps?

5. **WYSIWYG Editor Library**
   - TipTap (Vue/React)?
   - Lexical (React)?
   - Quill?
   - Slate?

6. **Encryption Key Management**
   - Store in macOS Keychain (automatic)?
   - Optional password protection?
   - Biometric unlock (Touch ID)?

## Project Structure (Proposed)

```
journal/
├── src-tauri/          # Tauri backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands.rs
│   │   └── sync.rs
│   └── Cargo.toml
├── src/                # Frontend
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   └── main.tsx
├── cloudflare-worker/  # Cloudflare Worker API
│   ├── src/
│   │   └── index.ts    # Worker handler
│   ├── wrangler.toml   # Cloudflare config
│   └── package.json
├── app.md              # This file
└── README.md
```

## Development Phases

### Phase 1: MVP
- [ ] Basic entry creation (title + text)
- [ ] Date navigation
- [ ] Local storage
- [ ] Today's entry auto-focus

### Phase 2: Core Features
- [ ] Tags
- [ ] Mood tracking
- [ ] Search
- [ ] Auto-scroll to new day

### Phase 3: Sync & Backup
- [ ] Set up Cloudflare Workers project
- [ ] Create R2 bucket configuration
- [ ] Implement Worker API endpoints (POST/GET /api/sync)
- [ ] Deploy Worker to Cloudflare
- [ ] First-launch onboarding flow
- [ ] Password-based vault creation
- [ ] Generate unique Vault ID (UUID v4)
- [ ] Password derivation (PBKDF2) for encryption key
- [ ] Store Vault ID encrypted in macOS Keychain
- [ ] Encrypt/decrypt journal data (AES-256-GCM)
- [ ] Sync functionality (POST/GET to Cloudflare Worker)
- [ ] Periodic background sync check
- [ ] Conflict resolution (timestamp-based, newer wins)
- [ ] Multi-device setup flow (enter Vault ID on second Mac)
- [ ] Handle offline/online sync states
- [ ] Sync status indicator

### Phase 4: Polish
- [ ] UI/UX refinements
- [ ] Animations
- [ ] Dark mode
- [ ] Export features

### Phase 5: Enhancements
- [ ] Statistics
- [ ] Templates
- [ ] Reminders
- [ ] Advanced features

## Next Steps

1. Answer clarification questions
2. Choose sync API solution
3. Set up Tauri 2.0 project
4. Design UI mockups/wireframes
5. Begin Phase 1 development

# Development Automation

This document describes all automated workflows and scripts in the project.

## Git Hooks (Husky)

### Pre-commit Hook

**Location**: `.husky/pre-commit`

**Triggers**: Before every commit

**Actions**:
- Runs `lint-staged` which executes full TypeScript type checking when `.ts` or `.tsx` files are staged
- Uses project's `tsconfig.json` configuration
- Blocks commit if there are type errors

**Purpose**: Ensures no TypeScript errors are committed

**Note**: This runs a full project type check (not just staged files) to ensure type consistency across the codebase

### Pre-push Hook

**Location**: `.husky/pre-push`

**Triggers**: Before every push

**Actions**:
- Runs version sync check across `package.json`, `Cargo.toml`, and `tauri.conf.json`
- Blocks push if versions are out of sync

**Purpose**: Ensures version numbers stay synchronized across all config files

## GitHub Actions Workflows

### 1. CI Workflow

**File**: `.github/workflows/ci.yml`

**Triggers**:
- Push to `main` or `master` branch
- Pull requests

**Actions**:
- Installs dependencies
- Runs TypeScript type checking (`npm run lint`)
- Builds frontend (`npm run build`)

**Purpose**: Continuous integration checks on every push

### 2. Release Workflow

**File**: `.github/workflows/release.yml`

**Triggers**:
- Git tags matching `v*` (e.g., `v1.0.0`)

**Actions**:
- Builds app for macOS (ARM64 + x86_64), Windows, and Linux
- Creates GitHub Release
- Attaches platform-specific binaries to the release
- Auto-generates release notes

**Purpose**: Automated multi-platform release builds

### 3. Version Check Workflow

**File**: `.github/workflows/version-check.yml`

**Triggers**:
- Push to `main` or `master` branch
- Pull requests

**Actions**:
- Verifies version sync across all files

**Purpose**: Additional safety check for version consistency

### 4. GitHub Pages Deployment

**File**: `.github/workflows/pages.yml`

**Triggers**:
- Push to `main` or `master` branch

**Actions**:
- Deploys `docs/` folder to GitHub Pages
- Landing page dynamically fetches latest release info

**Purpose**: Maintains public-facing landing page

## NPM Scripts

### Development
- `npm run dev` - Start Vite dev server
- `npm run tauri dev` - Start Tauri app in dev mode
- `npm run build` - Build frontend for production
- `npm run tauri build` - Build app for production

### Code Quality
- `npm run lint` - Run TypeScript type checking without emitting files

### Version Management
- `npm version patch/minor/major` - Bump version, sync files, create commit & tag
- `npm run version:update <version>` - Manually set specific version in all files
- `npm run version:check` - Verify version sync across all files

### Cloudflare Worker
- `npm run worker:dev` - Start worker in dev mode
- `npm run worker:deploy` - Deploy worker to Cloudflare

### Icon Generation
- `npm run icons:generate` - Generate app icons from SVG

## Version Management Scripts

### 1. update-version.cjs

**Usage**: `npm run version:update 1.2.3`

**What it does**:
- Updates version in `package.json`
- Updates version in `src-tauri/Cargo.toml`
- Updates version in `src-tauri/tauri.conf.json`
- Prints instructions for next steps

### 2. sync-version-from-package.cjs

**Usage**: Runs automatically via `postversion` hook

**What it does**:
- Reads version from `package.json`
- Syncs to `Cargo.toml` and `tauri.conf.json`
- Stages the updated files in git

**When**: After `npm version` command

### 3. check-version-sync.cjs

**Usage**: `npm run version:check`

**What it does**:
- Reads versions from all three files
- Exits with error if they don't match
- Used by pre-push hook and CI

## Icon Generation Scripts

### 1. generate-icons.js
Generates PNG icons from SVG source

### 2. generate-icns.js
Generates `.icns` file for macOS from SVG

### 3. generate-ico.js
Generates `.ico` file for Windows from SVG

**Usage**: `npm run icons:generate`

## Workflow Examples

### Making a Release

```bash
# Option 1: Automatic (recommended)
npm version patch -m "chore: release v%s"
git push origin main --tags

# Option 2: Manual
npm run version:update 1.0.0
git add .
git commit -m "chore: bump version to 1.0.0"
git tag v1.0.0
git push origin main --tags
```

### Fixing Version Mismatch

If pre-push hook blocks you:

```bash
npm run version:check  # See which files are out of sync
node scripts/sync-version-from-package.cjs  # Sync from package.json
git add .
git commit -m "chore: sync version files"
```

### Working with Pre-commit Hook

The hook runs automatically, but you can test it:

```bash
git add .
npx lint-staged  # Manual test
git commit -m "your message"  # Hook runs automatically
```

## Bypassing Hooks (Emergency Only)

```bash
# Skip pre-commit (not recommended)
git commit --no-verify

# Skip pre-push (not recommended)
git push --no-verify
```

**Warning**: Only use `--no-verify` in emergencies. Fix the actual issues instead.

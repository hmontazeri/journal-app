# Version Management

This project uses automated version synchronization across multiple files.

## Version Files

The version number is stored in three places:
- `package.json` (Node/npm)
- `src-tauri/Cargo.toml` (Rust)
- `src-tauri/tauri.conf.json` (Tauri config)

## Quick Release Process

### Option 1: Using npm version (Recommended)

```bash
# Bump patch version (1.0.0 -> 1.0.1)
npm version patch -m "chore: release v%s"

# Bump minor version (1.0.0 -> 1.1.0)
npm version minor -m "chore: release v%s"

# Bump major version (1.0.0 -> 2.0.0)
npm version major -m "chore: release v%s"

# Push tags
git push origin main --tags
```

This automatically:
1. Updates `package.json` version
2. Syncs version to `Cargo.toml` and `tauri.conf.json`
3. Creates a git commit
4. Creates a git tag

### Option 2: Manual Version Update

```bash
# Update to a specific version
npm run version:update 1.2.3

# Then commit and tag manually
git add .
git commit -m "chore: bump version to 1.2.3"
git tag v1.2.3
git push origin main --tags
```

## How It Works

1. **npm version command**: When you run `npm version patch/minor/major`, npm:
   - Updates `package.json`
   - Runs the `postversion` script
   - Creates a git commit
   - Creates a git tag

2. **postversion script**: Automatically syncs the version from `package.json` to:
   - `src-tauri/Cargo.toml`
   - `src-tauri/tauri.conf.json`
   - Stages these files in git

3. **GitHub Actions**: When you push a tag:
   - The release workflow builds for all platforms
   - Creates a GitHub Release with the tag version
   - Attaches platform-specific binaries

## Troubleshooting

### Versions out of sync?

Check version sync status:

```bash
npm run version:check
```

If out of sync, run this to sync all files to the version in `package.json`:

```bash
node scripts/sync-version-from-package.cjs
```

### Want to set a specific version everywhere?

```bash
npm run version:update 1.0.0
```

## Pre-release Versions

For beta/alpha releases:

```bash
# Create a prerelease version
npm version prerelease --preid=beta -m "chore: release v%s"
# Results in: 1.0.0-beta.0

# Or manually
npm run version:update 1.0.0-beta.1
git add .
git commit -m "chore: release v1.0.0-beta.1"
git tag v1.0.0-beta.1
git push origin main --tags
```

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read versions from all files
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const packageVersion = packageJson.version;

const cargoTomlPath = path.join(__dirname, '..', 'src-tauri', 'Cargo.toml');
const cargoToml = fs.readFileSync(cargoTomlPath, 'utf8');
const cargoVersionMatch = cargoToml.match(/^version = "(.*)"$/m);
const cargoVersion = cargoVersionMatch ? cargoVersionMatch[1] : null;

const tauriConfPath = path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json');
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
const tauriVersion = tauriConf.version;

// Check if all versions match
const allMatch = packageVersion === cargoVersion && packageVersion === tauriVersion;

if (!allMatch) {
  console.error('❌ Version mismatch detected:\n');
  console.error(`  package.json:            ${packageVersion}`);
  console.error(`  src-tauri/Cargo.toml:    ${cargoVersion}`);
  console.error(`  src-tauri/tauri.conf.json: ${tauriVersion}`);
  console.error('\nRun this to sync versions:');
  console.error('  node scripts/sync-version-from-package.js\n');
  process.exit(1);
}

console.log(`✓ All version files synced to ${packageVersion}`);

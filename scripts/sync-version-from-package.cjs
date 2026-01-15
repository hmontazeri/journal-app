#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read version from package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

console.log(`Syncing version ${version} to Tauri files...`);

// Update Cargo.toml
const cargoTomlPath = path.join(__dirname, '..', 'src-tauri', 'Cargo.toml');
let cargoToml = fs.readFileSync(cargoTomlPath, 'utf8');
cargoToml = cargoToml.replace(/^version = ".*"$/m, `version = "${version}"`);
fs.writeFileSync(cargoTomlPath, cargoToml);
console.log('✓ Updated src-tauri/Cargo.toml');

// Update tauri.conf.json
const tauriConfPath = path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json');
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
tauriConf.version = version;
fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');
console.log('✓ Updated src-tauri/tauri.conf.json');

// Stage the updated files
const { execSync } = require('child_process');
try {
  execSync('git add src-tauri/Cargo.toml src-tauri/tauri.conf.json', { stdio: 'inherit' });
  console.log('✓ Staged Tauri version files');
} catch (error) {
  console.warn('⚠ Could not stage files (not in a git repo or git not available)');
}

console.log(`\nVersion ${version} synced successfully!`);

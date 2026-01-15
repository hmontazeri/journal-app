#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get version from command line argument or package.json
const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Usage: npm run version:update <version>');
  console.error('Example: npm run version:update 1.0.0');
  process.exit(1);
}

// Validate version format (semver)
if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/.test(newVersion)) {
  console.error('Error: Version must be in semver format (e.g., 1.0.0 or 1.0.0-beta.1)');
  process.exit(1);
}

console.log(`Updating version to ${newVersion}...`);

// Update package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✓ Updated package.json');

// Update Cargo.toml
const cargoTomlPath = path.join(__dirname, '..', 'src-tauri', 'Cargo.toml');
let cargoToml = fs.readFileSync(cargoTomlPath, 'utf8');
cargoToml = cargoToml.replace(/^version = ".*"$/m, `version = "${newVersion}"`);
fs.writeFileSync(cargoTomlPath, cargoToml);
console.log('✓ Updated src-tauri/Cargo.toml');

// Update tauri.conf.json
const tauriConfPath = path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json');
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
tauriConf.version = newVersion;
fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');
console.log('✓ Updated src-tauri/tauri.conf.json');

console.log(`\nVersion updated to ${newVersion} in all files!`);
console.log('\nNext steps:');
console.log(`  git add .`);
console.log(`  git commit -m "chore: bump version to ${newVersion}"`);
console.log(`  git tag v${newVersion}`);
console.log(`  git push origin main --tags`);

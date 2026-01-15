import sharp from 'sharp';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, rmSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const iconsDir = join(__dirname, '../src-tauri/icons');
const svgPath = join(iconsDir, 'icon.svg');
const iconsetPath = join(iconsDir, 'icon.iconset');

// macOS iconset requires specific sizes with specific names
const iconsetSizes = [
  { name: 'icon_16x16.png', size: 16 },
  { name: 'icon_16x16@2x.png', size: 32 },
  { name: 'icon_32x32.png', size: 32 },
  { name: 'icon_32x32@2x.png', size: 64 },
  { name: 'icon_128x128.png', size: 128 },
  { name: 'icon_128x128@2x.png', size: 256 },
  { name: 'icon_256x256.png', size: 256 },
  { name: 'icon_256x256@2x.png', size: 512 },
  { name: 'icon_512x512.png', size: 512 },
  { name: 'icon_512x512@2x.png', size: 1024 },
];

async function generateIcns() {
  console.log('Generating macOS .icns file...');
  
  // Create iconset directory
  try {
    rmSync(iconsetPath, { recursive: true, force: true });
  } catch (e) {
    // Directory doesn't exist, that's fine
  }
  mkdirSync(iconsetPath, { recursive: true });
  
  // Generate all required PNG sizes
  for (const { name, size } of iconsetSizes) {
    try {
      await sharp(svgPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(join(iconsetPath, name));
      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }
  
  // Convert iconset to icns using iconutil
  try {
    const icnsOutput = join(iconsDir, 'icon.icns');
    execSync(`iconutil -c icns "${iconsetPath}" -o "${icnsOutput}"`, {
      stdio: 'inherit'
    });
    console.log('\n✓ Generated icon.icns successfully!');
    
    // Clean up iconset directory
    rmSync(iconsetPath, { recursive: true, force: true });
    console.log('✓ Cleaned up temporary iconset directory');
  } catch (error) {
    console.error('\n✗ Failed to generate .icns file:', error.message);
    console.log('The iconset directory has been kept at:', iconsetPath);
    console.log('You can manually convert it using: iconutil -c icns icon.iconset -o icon.icns');
  }
}

generateIcns().catch(console.error);

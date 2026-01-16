import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Source icon
const sourceIcon = join(__dirname, '../src-tauri/icons/icon.svg');
// Output directory
const outputDir = join(__dirname, '../public');

// Ensure public directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir);
}

const icons = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 }, // For iOS
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
];

async function generatePwaIcons() {
  console.log('Generating PWA icons...');

  try {
    // Generate favicon.ico (multi-size) - for now just copy 32x32 as .ico or separate generation?
    // Sharp doesn't directly support .ico with multiple sizes easily without plugins.
    // For simplicity, we'll generate the PNGs first.

    for (const icon of icons) {
      await sharp(sourceIcon)
        .resize(icon.size, icon.size)
        .png()
        .toFile(join(outputDir, icon.name));
      console.log(`Generated ${icon.name}`);
    }
    
    // Also generate a simple favicon.ico from the 32x32 png if possible, 
    // but typically browsers support png favicons now. 
    // We can just rely on the pngs for the manifest.

  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generatePwaIcons();

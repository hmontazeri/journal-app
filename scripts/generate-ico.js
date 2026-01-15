import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const iconsDir = join(__dirname, '../src-tauri/icons');
const svgPath = join(iconsDir, 'icon.svg');

async function generateIco() {
  console.log('Generating Windows .ico file...');
  
  // ICO files can contain multiple sizes
  // We'll create a 256x256 ICO which is standard
  try {
    await sharp(svgPath)
      .resize(256, 256, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(join(iconsDir, 'icon.ico'));
    console.log('✓ Generated icon.ico (256x256)');
  } catch (error) {
    console.error('✗ Failed to generate icon.ico:', error.message);
  }
}

generateIco().catch(console.error);

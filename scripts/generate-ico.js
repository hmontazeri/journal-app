import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const iconsDir = join(__dirname, '../src-tauri/icons');
const svgPath = join(iconsDir, 'icon.svg');

async function generateIco() {
  console.log('Generating Windows icon files...');
  
  // Standard ICO sizes
  const icoSizes = [16, 24, 32, 48, 64, 128, 256];
  const pngBuffers = [];
  
  try {
    // Generate all PNG sizes and collect buffers for ICO
    for (const size of icoSizes) {
      const pngBuffer = await sharp(svgPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toBuffer();
      
      // Save individual PNG
      await sharp(pngBuffer).toFile(join(iconsDir, `${size}x${size}.png`));
      console.log(`✓ Generated ${size}x${size}.png`);
      
      pngBuffers.push(pngBuffer);
    }
    
    // Create a 256x256 icon.png as fallback
    await sharp(svgPath)
      .resize(256, 256, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(join(iconsDir, 'icon.png'));
    console.log('✓ Generated icon.png (256x256)');
    
    // Generate actual ICO file from PNG buffers
    const icoBuffer = await pngToIco(pngBuffers);
    writeFileSync(join(iconsDir, 'icon.ico'), icoBuffer);
    console.log('✓ Generated icon.ico');
    
    console.log('\nAll icon files generated successfully!');
  } catch (error) {
    console.error('✗ Failed to generate icon files:', error.message);
    process.exit(1);
  }
}

generateIco().catch(console.error);

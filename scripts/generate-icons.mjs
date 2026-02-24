#!/usr/bin/env node

/**
 * Icon generation script using Sharp
 * Converts SVG icons to PNG format
 * 
 * Usage: node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '../public');

const iconConfigs = [
  {
    input: path.join(publicDir, 'icon.svg'),
    output: path.join(publicDir, 'icon-dark-32x32.png'),
    width: 32,
    height: 32,
    description: 'Dark icon 32x32',
  },
  {
    input: path.join(publicDir, 'icon.svg'),
    output: path.join(publicDir, 'apple-icon.png'),
    width: 180,
    height: 180,
    description: 'Apple icon 180x180',
  },
  {
    input: path.join(publicDir, 'placeholder-logo.svg'),
    output: path.join(publicDir, 'placeholder-logo.png'),
    width: 200,
    height: 60,
    description: 'Logo PNG 200x60',
  },
];

async function generateIcons() {
  console.log('🎨 Generating PNG icons from SVG...\n');

  for (const config of iconConfigs) {
    try {
      await sharp(config.input)
        .png({ quality: 90 })
        .resize(config.width, config.height, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toFile(config.output);

      console.log(`✅ ${config.description}: ${config.output}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${config.description}:`, error.message);
    }
  }

  console.log('\n🎉 Icon generation complete!');
}

generateIcons().catch(console.error);

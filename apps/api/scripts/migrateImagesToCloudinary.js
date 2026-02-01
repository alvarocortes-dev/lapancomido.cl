/**
 * Migration script: Upload all local images to Cloudinary
 * 
 * Context-aware optimizations (based on actual UI usage):
 * 
 * - Logo Header/Footer: displayed at h-24 max (96px). With 2x DPR → 200px height
 * - Slider/Hero: container ~1280px wide, aspect 21/9. With 2x DPR → 1920px width
 * - Bento Grid: 4 cols, each ~320px. With 2x DPR → 800px width
 * - pancito_404: medium display → 400px width
 * 
 * Auto-format: Cloudinary serves WebP/AVIF based on browser support
 * 
 * Usage: 
 *   cd apps/api
 *   node scripts/migrateImagesToCloudinary.js
 * 
 * Prerequisites:
 *   - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env
 */

import 'dotenv/config';
import cloudinary from '../cloudinaryConfig.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '../../web/src/assets/images');
const OUTPUT_FILE = path.join(__dirname, 'cloudinary-urls.json');

// Configuration for different image types based on ACTUAL UI context
const IMAGE_CONFIG = {
  // Slides (hero images) - container ~1280px, need 2x for retina
  slides: {
    pattern: /^slide-\d+\.jpg$/,
    folder: 'lapancomido/slides',
    transformation: {
      width: 1920,
      crop: 'limit',
      quality: 'auto:good',
      fetch_format: 'auto'
    }
  },
  // Logos - displayed at max h-24 (96px), need 2x for retina = ~200px height
  logos: {
    pattern: /^logo/,
    folder: 'lapancomido/brand',
    transformation: {
      height: 200,
      crop: 'limit',
      quality: 'auto:best', // Higher quality for logos
      fetch_format: 'auto'
    }
  },
  // 404 pancito - medium size element
  pancito: {
    pattern: /^pancito/,
    folder: 'lapancomido/brand',
    transformation: {
      width: 400,
      crop: 'limit',
      quality: 'auto:good',
      fetch_format: 'auto'
    }
  },
  // Gallery images (bento grid) - 4 cols ~320px each, 2x for retina = 640px, buffer to 800px
  gallery: {
    pattern: /\.jpg$/, // Default for all other JPGs
    folder: 'lapancomido/gallery',
    transformation: {
      width: 800,
      crop: 'limit',
      quality: 'auto:good',
      fetch_format: 'auto'
    }
  }
};

function getImageConfig(filename) {
  if (IMAGE_CONFIG.slides.pattern.test(filename)) {
    return { type: 'slides', config: IMAGE_CONFIG.slides };
  }
  if (IMAGE_CONFIG.logos.pattern.test(filename)) {
    return { type: 'logos', config: IMAGE_CONFIG.logos };
  }
  if (IMAGE_CONFIG.pancito.pattern.test(filename)) {
    return { type: 'pancito', config: IMAGE_CONFIG.pancito };
  }
  return { type: 'gallery', config: IMAGE_CONFIG.gallery };
}

async function uploadImage(filePath, filename) {
  const { type, config } = getImageConfig(filename);
  const publicId = `${config.folder}/${path.parse(filename).name}`;
  
  console.log(`  Uploading: ${filename} -> ${publicId} (${type})`);
  
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      overwrite: true,
      resource_type: 'image',
      transformation: config.transformation
    });
    
    return {
      filename,
      type,
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format
    };
  } catch (error) {
    console.error(`  ERROR uploading ${filename}:`, error.message);
    return { filename, error: error.message };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Cloudinary Image Migration Script');
  console.log('='.repeat(60));
  
  // Verify Cloudinary config
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error('ERROR: CLOUDINARY_CLOUD_NAME not set in .env');
    process.exit(1);
  }
  console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}\n`);
  
  // Get all images
  const files = fs.readdirSync(IMAGES_DIR)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  
  console.log(`Found ${files.length} images to upload\n`);
  
  // Categorize
  const categories = { slides: [], logos: [], pancito: [], gallery: [] };
  files.forEach(f => {
    const { type } = getImageConfig(f);
    categories[type].push(f);
  });
  
  console.log(`Categories:`);
  console.log(`  - Slides (1920px): ${categories.slides.length} images`);
  console.log(`  - Logos (200px h): ${categories.logos.length} images`);
  console.log(`  - Pancito (400px): ${categories.pancito.length} images`);
  console.log(`  - Gallery (800px): ${categories.gallery.length} images\n`);
  
  // Upload all
  const results = {
    success: [],
    errors: [],
    mapping: {} // filename -> cloudinary URL
  };
  
  console.log('Starting upload...\n');
  
  for (const file of files) {
    const filePath = path.join(IMAGES_DIR, file);
    const result = await uploadImage(filePath, file);
    
    if (result.error) {
      results.errors.push(result);
    } else {
      results.success.push(result);
      results.mapping[file] = {
        url: result.url,
        publicId: result.publicId
      };
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('MIGRATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`Successfully uploaded: ${results.success.length}`);
  console.log(`Errors: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\nFailed uploads:');
    results.errors.forEach(e => console.log(`  - ${e.filename}: ${e.error}`));
  }
  
  // Calculate savings
  const originalBytes = results.success.reduce((sum, r) => {
    const stat = fs.statSync(path.join(IMAGES_DIR, r.filename));
    return sum + stat.size;
  }, 0);
  const cloudinaryBytes = results.success.reduce((sum, r) => sum + r.bytes, 0);
  
  console.log(`\nSize comparison:`);
  console.log(`  Original: ${(originalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Cloudinary: ${(cloudinaryBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Savings: ${((1 - cloudinaryBytes / originalBytes) * 100).toFixed(1)}%`);
  
  // Save mapping file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results.mapping, null, 2));
  console.log(`\nURL mapping saved to: ${OUTPUT_FILE}`);
  
  // Generate helper for code update
  console.log('\n' + '='.repeat(60));
  console.log('NEXT STEPS:');
  console.log('='.repeat(60));
  console.log('1. Update apps/web/src/data/images.json with Cloudinary URLs');
  console.log('2. Update apps/web/src/data/slides.json with Cloudinary URLs');
  console.log('3. Update Header.jsx, Footer.jsx, Page404.jsx to use URLs');
  console.log('4. Remove apps/web/src/assets/images/ folder');
  console.log('5. Commit and deploy');
}

main().catch(console.error);

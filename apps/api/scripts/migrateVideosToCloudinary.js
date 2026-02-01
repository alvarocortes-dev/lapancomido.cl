/**
 * Migration script: Upload videos to Cloudinary
 * 
 * Videos are uploaded with auto quality and format.
 * 
 * Usage: 
 *   cd apps/api
 *   node scripts/migrateVideosToCloudinary.js
 */

require('dotenv').config();
const cloudinary = require('../cloudinaryConfig');
const fs = require('fs');
const path = require('path');

const VIDEOS_DIR = path.join(__dirname, '../../web/src/assets/videos');
const OUTPUT_FILE = path.join(__dirname, 'cloudinary-video-urls.json');

async function uploadVideo(filePath, filename) {
  const publicId = `lapancomido/videos/${path.parse(filename).name}`;
  
  console.log(`  Uploading: ${filename} -> ${publicId}`);
  
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      overwrite: true,
      resource_type: 'video',
      // Video transformations for optimization
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    
    return {
      filename,
      publicId: result.public_id,
      url: result.secure_url,
      duration: result.duration,
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
  console.log('Cloudinary Video Migration Script');
  console.log('='.repeat(60));
  
  // Verify Cloudinary config
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error('ERROR: CLOUDINARY_CLOUD_NAME not set in .env');
    process.exit(1);
  }
  console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}\n`);
  
  // Get all videos
  const files = fs.readdirSync(VIDEOS_DIR)
    .filter(f => /\.(mp4|webm|mov)$/i.test(f));
  
  console.log(`Found ${files.length} videos to upload\n`);
  
  // Upload all
  const results = {
    success: [],
    errors: [],
    mapping: {}
  };
  
  console.log('Starting upload...\n');
  
  for (const file of files) {
    const filePath = path.join(VIDEOS_DIR, file);
    const result = await uploadVideo(filePath, file);
    
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
    const stat = fs.statSync(path.join(VIDEOS_DIR, r.filename));
    return sum + stat.size;
  }, 0);
  const cloudinaryBytes = results.success.reduce((sum, r) => sum + r.bytes, 0);
  
  console.log(`\nSize comparison:`);
  console.log(`  Original: ${(originalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Cloudinary: ${(cloudinaryBytes / 1024 / 1024).toFixed(2)} MB`);
  
  // Save mapping file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results.mapping, null, 2));
  console.log(`\nURL mapping saved to: ${OUTPUT_FILE}`);
  
  // Show URLs for code update
  console.log('\n' + '='.repeat(60));
  console.log('VIDEO URLS FOR CODE UPDATE:');
  console.log('='.repeat(60));
  results.success.forEach(v => {
    console.log(`${v.filename}: ${v.url}`);
  });
}

main().catch(console.error);

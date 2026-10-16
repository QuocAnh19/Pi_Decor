import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve('apps/web/public');
const IMAGES_DIR = path.resolve('apps/web/public/images');

async function processFavicon() {
  const svgPath = path.join(PUBLIC_DIR, 'favicon.svg');
  if (!fs.existsSync(svgPath)) {
    console.log('favicon.svg not found, skipping');
    return;
  }
  const svg = fs.readFileSync(svgPath, 'utf8');
  const match = svg.match(/xlink:href="data:image\/png;base64,([^"]+)"/);
  if (!match) {
    console.warn('No embedded base64 png found in favicon.svg');
    return;
  }

  const rawBuffer = Buffer.from(match[1], 'base64');
  console.log(`Extracted raw raster image from favicon.svg: ${rawBuffer.length} bytes`);

  // 1. favicon-32.png
  await sharp(rawBuffer)
    .resize(32, 32)
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(PUBLIC_DIR, 'favicon-32.png'));
  console.log('Generated favicon-32.png');

  // 2. icon-192.png
  await sharp(rawBuffer)
    .resize(192, 192)
    .png({ quality: 85, compressionLevel: 9 })
    .toFile(path.join(PUBLIC_DIR, 'icon-192.png'));
  console.log('Generated icon-192.png');

  // 3. apple-touch-icon.png (180x180)
  await sharp(rawBuffer)
    .resize(180, 180)
    .png({ quality: 85, compressionLevel: 9 })
    .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // 4. favicon.ico (can be a 32x32 PNG renamed or encoded as ICO)
  // Most modern browsers accept 32x32 PNG content as favicon.ico or we generate standard ico buffer
  // In sharp, creating 32x32 png is standard and widely supported when served as .ico
  const icoBuffer = await sharp(rawBuffer).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), icoBuffer);
  console.log('Generated favicon.ico');

  // Remove the old heavy 376KB favicon.svg
  fs.unlinkSync(svgPath);
  console.log('Removed heavy favicon.svg');
}

async function processImages() {
  const images = [
    { name: 'hero.jpg', isHero: true },
    { name: 'hero-collage-1.jpg', isHero: false },
    { name: 'hero-collage-2.jpg', isHero: false },
    { name: 'service-piwedding.png', isHero: false },
    { name: 'service-pikids.png', isHero: false },
    { name: 'service-pievent.png', isHero: false },
  ];

  for (const img of images) {
    const inputPath = path.join(IMAGES_DIR, img.name);
    if (!fs.existsSync(inputPath)) {
      console.warn(`File not found: ${inputPath}`);
      continue;
    }

    const baseName = img.name.replace(/\.[^.]+$/, '');
    const meta = await sharp(inputPath).metadata();
    console.log(`Processing ${img.name}: ${meta.width}x${meta.height}, original size: ${fs.statSync(inputPath).size} bytes`);

    // Generate responsive webp versions: 800w and 1600w (or original width if smaller)
    const widths = [800, 1600];
    for (const w of widths) {
      if (meta.width && meta.width < w && w > 800) {
        // If image original width is smaller than 1600, skip 1600w or cap at meta.width
        continue;
      }
      const targetWidth = Math.min(w, meta.width || w);
      const outName = `${baseName}-${w}w.webp`;
      const outPath = path.join(IMAGES_DIR, outName);

      await sharp(inputPath)
        .resize({ width: targetWidth, withoutEnlargement: true })
        .webp({ quality: 78, effort: 6 })
        .toFile(outPath);

      const outStat = fs.statSync(outPath);
      console.log(` -> Created ${outName} (${outStat.size} bytes)`);
    }

    // Also generate a default fallback .webp with same base name
    const defaultWebpPath = path.join(IMAGES_DIR, `${baseName}.webp`);
    await sharp(inputPath)
      .resize({ width: Math.min(meta.width || 1600, 1600), withoutEnlargement: true })
      .webp({ quality: 78, effort: 6 })
      .toFile(defaultWebpPath);
    console.log(` -> Created ${baseName}.webp (${fs.statSync(defaultWebpPath).size} bytes)`);
  }
}

async function run() {
  console.log('--- Starting image and icon optimization ---');
  await processFavicon();
  await processImages();
  console.log('--- Finished optimization successfully ---');
}

run().catch((err) => {
  console.error('Error during image optimization:', err);
  process.exit(1);
});

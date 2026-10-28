// Обложка статьи блога в едином стиле: бренд-градиент, wordmark, заголовок и три фото в белых рамках.
// Результат пишется в public/blog-assets/<slug>/cover.webp (1600x900).
//
// Использование:
//   node scripts/blog-cover.mjs <slug> "<ЗАГОЛОВОК КАПИТЕЛЬЮ>" <foto1> <foto2> <foto3>
// Фото - пути относительно public/blog-assets/<slug>/ либо абсолютные (например, скачанные из каталога).
// Пример:
//   node scripts/blog-cover.mjs look-festa-fim-de-ano "LOOK PARA A FESTA DE FIM DE ANO" 01-empresa.webp 02-amigos.webp 03-reveillon.webp
import { existsSync, writeFileSync } from 'node:fs';
import { resolve, isAbsolute } from 'node:path';
import sharp from 'sharp';

const [slug, title, ...photos] = process.argv.slice(2);

if (!slug || !title || photos.length !== 3) {
  console.error('Нужно: <slug> "<ЗАГОЛОВОК>" <foto1> <foto2> <foto3>');
  process.exit(1);
}

const dir = resolve('public/blog-assets', slug);
const files = photos.map(p => (isAbsolute(p) ? p : resolve(dir, p)));

for (const f of files) {
  if (!existsSync(f)) {
    console.error('Нет файла:', f);
    process.exit(1);
  }
}

const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const background = `<svg width="1600" height="900" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fdf2f8"/>
      <stop offset="1" stop-color="#fbcfe8"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#g)"/>
  <circle cx="1480" cy="80" r="200" fill="#ffffff" opacity="0.35"/>
  <circle cx="120" cy="840" r="160" fill="#ffffff" opacity="0.25"/>
  <text x="800" y="110" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="60" fill="#111111">a<tspan font-family="Helvetica, Arial, sans-serif" font-style="normal" font-weight="bold">moda</tspan></text>
  <text x="800" y="168" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="30" letter-spacing="5" fill="#831843">${escape(title)}</text>
</svg>`;

const PHOTO_W = 1600 / 4;
const PHOTO_H = 640;
const PHOTO_TOP = 220;
const PHOTO_X = [160, 600, 1040];
const FRAME = 8;

const frame = Buffer.from(
  `<svg width="${PHOTO_W + FRAME * 2}" height="${PHOTO_H + FRAME * 2}" xmlns="http://www.w3.org/2000/svg"><rect width="${PHOTO_W + FRAME * 2}" height="${PHOTO_H + FRAME * 2}" rx="24" fill="#ffffff"/></svg>`,
);

const layers = [];

for (const [i, file] of files.entries()) {
  // Кадрируем сверху: на портретных фото так остаётся лицо и верх платья
  const photo = await sharp(file).resize({ width: PHOTO_W, height: PHOTO_H, fit: 'cover', position: 'top' }).toBuffer();

  layers.push({ input: frame, left: PHOTO_X[i] - FRAME, top: PHOTO_TOP - FRAME });
  layers.push({ input: photo, left: PHOTO_X[i], top: PHOTO_TOP });
}

const output = await sharp(Buffer.from(background)).composite(layers).webp({ quality: 82 }).toBuffer();
const outPath = resolve(dir, 'cover.webp');

writeFileSync(outPath, output);
console.log(`${outPath} (${Math.round(output.length / 1024)} KB)`);

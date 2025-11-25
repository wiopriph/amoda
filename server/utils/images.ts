import sharp from 'sharp';
import { createError } from 'h3';


export async function processImageBuffer(
  buffer: Buffer,
  opts: { width?: number; height?: number } = {},
) {
  const { width = 1920, height = 1080 } = opts;

  try {
    return await sharp(buffer)
      .rotate()
      .resize({
        width,
        height,
        fit: 'inside',
      })
      .toFormat('webp', { quality: 80 })
      .toBuffer();
  } catch (error) {
    console.error('Error processing image:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error processing image',
    });
  }
}

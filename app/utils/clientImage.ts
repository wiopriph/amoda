// Ресайз изображений в браузере при загрузке в админке.
// Сервер (Cloudflare Workers) не умеет sharp, поэтому всё жмётся до отправки.

type Fit = 'inside' | 'cover';

type ResizeOptions = {
  width: number
  height: number
  fit: Fit
  quality: number
};

const decodeImage = async (file: File): Promise<ImageBitmap> => {
  try {
    // from-image применяет EXIF-поворот с телефонных фото
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error(`Não foi possível ler a imagem «${file.name}». Usa JPG, PNG ou WebP.`);
  }
};

export async function resizeImageToWebp(file: File, options: ResizeOptions): Promise<Blob> {
  const bitmap = await decodeImage(file);

  const { width: targetWidth, height: targetHeight, fit, quality } = options;

  let canvasWidth: number;
  let canvasHeight: number;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = bitmap.width;
  let sourceHeight = bitmap.height;

  if (fit === 'cover') {
    canvasWidth = targetWidth;
    canvasHeight = targetHeight;

    const scale = Math.max(targetWidth / bitmap.width, targetHeight / bitmap.height);

    sourceWidth = Math.round(targetWidth / scale);
    sourceHeight = Math.round(targetHeight / scale);
    sourceX = Math.round((bitmap.width - sourceWidth) / 2);
    sourceY = Math.round((bitmap.height - sourceHeight) / 2);
  } else {
    // inside: вписать без обрезки, никогда не растягивать мелкий оригинал
    const scale = Math.min(1, targetWidth / bitmap.width, targetHeight / bitmap.height);

    canvasWidth = Math.max(1, Math.round(bitmap.width * scale));
    canvasHeight = Math.max(1, Math.round(bitmap.height * scale));
  }

  const canvas = document.createElement('canvas');

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const context = canvas.getContext('2d');

  if (!context) {
    bitmap.close();
    throw new Error('Canvas indisponível neste navegador.');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvasWidth, canvasHeight);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/webp', quality);
  });

  if (!blob || blob.type !== 'image/webp') {
    throw new Error('Este navegador não consegue gerar WebP — usa o Chrome para carregar fotos.');
  }

  return blob;
}

// Фото товара: мастер для галереи/зума + превью для карточек каталога
export async function prepareProductImage(file: File): Promise<{ full: Blob; small: Blob }> {
  const [full, small] = await Promise.all([
    resizeImageToWebp(file, { width: 1600, height: 2000, fit: 'inside', quality: 0.8 }),
    resizeImageToWebp(file, { width: 480, height: 640, fit: 'inside', quality: 0.75 }),
  ]);

  return { full, small };
}

// Фото категории: квадрат 400, как раньше делал sharp на сервере
export function prepareCategoryImage(file: File): Promise<Blob> {
  return resizeImageToWebp(file, { width: 400, height: 400, fit: 'cover', quality: 0.82 });
}

import type { MultiPartData } from 'h3';


// Клиент обязан прислать уже сжатый webp — сервер без sharp ничего не перекодирует
export function assertUploadedWebp(part: MultiPartData | undefined, maxBytes: number) {
  if (!part?.data?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Empty file' });
  }

  if (part.type !== 'image/webp') {
    throw createError({ statusCode: 400, statusMessage: 'Only webp uploads are accepted' });
  }

  // Сигнатура RIFF....WEBP, чтобы content-type не был голословным
  const head = part.data.subarray(0, 12);

  if (head.length < 12 || head.toString('ascii', 0, 4) !== 'RIFF' || head.toString('ascii', 8, 12) !== 'WEBP') {
    throw createError({ statusCode: 400, statusMessage: 'File is not a valid webp' });
  }

  if (part.data.length > maxBytes) {
    throw createError({ statusCode: 400, statusMessage: 'File is too large' });
  }
}

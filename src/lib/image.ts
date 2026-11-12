// Prépare la photo d'identité : recadrage centré au format 35 x 45 mm (7:9),
// réduction et conversion en JPEG pour rester très en dessous de la limite d'un document Firestore.

const OUT_WIDTH = 420;
const OUT_HEIGHT = 540;
const MIN_WIDTH = 300;
const MIN_HEIGHT = 380;
const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const MAX_OUTPUT_CHARS = 250_000;

export class PhotoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PhotoError';
  }
}

export async function prepareIdPhoto(file: File): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    throw new PhotoError('Unsupported format. Please use a JPG, PNG or WebP photo.');
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new PhotoError('The photo is larger than 8 MB. Please choose a smaller file.');
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new PhotoError('This image could not be read. Please try another file.');
  }

  if (bitmap.width < MIN_WIDTH || bitmap.height < MIN_HEIGHT) {
    bitmap.close();
    throw new PhotoError(
      `Photo too small (minimum ${MIN_WIDTH} × ${MIN_HEIGHT} pixels).`,
    );
  }

  const canvas = document.createElement('canvas');
  canvas.width = OUT_WIDTH;
  canvas.height = OUT_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new PhotoError('Your browser cannot process this image.');
  }

  // Fond blanc : un PNG transparent deviendrait noir une fois converti en JPEG.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, OUT_WIDTH, OUT_HEIGHT);

  const scale = Math.max(OUT_WIDTH / bitmap.width, OUT_HEIGHT / bitmap.height);
  const srcW = OUT_WIDTH / scale;
  const srcH = OUT_HEIGHT / scale;
  const srcX = (bitmap.width - srcW) / 2;
  const srcY = (bitmap.height - srcH) / 2;
  ctx.drawImage(bitmap, srcX, srcY, srcW, srcH, 0, 0, OUT_WIDTH, OUT_HEIGHT);
  bitmap.close();

  for (const quality of [0.85, 0.75, 0.65]) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (dataUrl.length <= MAX_OUTPUT_CHARS) return dataUrl;
  }
  throw new PhotoError('The photo is still too large after processing. Please try another one.');
}

// Copie de la pièce d'identité ou du passeport (facultative) : PDF ou image. Elle est stockée dans le
// document Firestore (limite 1 Mo, photo comprise), d'où le plafond de 500 Ko après traitement.
const DOC_MAX_BYTES = 500 * 1024;
const DOC_MAX_SIDE = 1600;

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new PhotoError('This file could not be read. Please try another one.'));
    reader.readAsDataURL(file);
  });
}

export async function prepareIdDocument(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    if (file.size > DOC_MAX_BYTES) {
      throw new PhotoError(
        'This PDF is larger than 500 KB. Compress it, or upload a photo or scan as an image (JPG, PNG or WebP): images are reduced automatically.',
      );
    }
    return readAsDataUrl(file);
  }
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    throw new PhotoError('Unsupported format. Please use a PDF, JPG, PNG or WebP file.');
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new PhotoError('The file is larger than 8 MB. Please choose a smaller one.');
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new PhotoError('This image could not be read. Please try another file.');
  }
  const scale = Math.min(1, DOC_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new PhotoError('Your browser cannot process this image.');
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const quality of [0.85, 0.7, 0.55, 0.4]) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (dataUrl.length <= Math.floor((DOC_MAX_BYTES * 4) / 3)) return dataUrl;
  }
  throw new PhotoError('The image is still too large after processing. Please try another one.');
}

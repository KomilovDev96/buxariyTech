import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { MAX_UPLOAD_BYTES } from '@buhariy/contracts';
export async function prepareImage(file: Express.Multer.File) {
  if (!file || file.size > MAX_UPLOAD_BYTES)
    throw new BadRequestException('Image required; maximum 8 MB');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
    throw new BadRequestException('Only JPEG, PNG and WebP images are supported');
  try {
    const meta = await sharp(file.buffer, { limitInputPixels: 40000000 }).metadata();
    const expected: Record<string, string> = {
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };
    if (
      !meta.format ||
      expected[meta.format] !== file.mimetype ||
      !meta.width ||
      !meta.height ||
      meta.width < 64 ||
      meta.height < 64 ||
      meta.width > 8000 ||
      meta.height > 8000 ||
      (meta.pages || 1) > 1
    )
      throw new Error();
    return await sharp(file.buffer, { limitInputPixels: 40000000 })
      .rotate()
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer();
  } catch {
    throw new BadRequestException(
      'Invalid image. Dimensions must be 64–8000 pixels; animated files are not supported',
    );
  }
}

import { BadRequestException } from '@nestjs/common';

export function parseBrandColor(value: unknown): string {
  if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value))
    throw new BadRequestException('Kulüp rengi #RRGGBB biçiminde olmalıdır.');
  return value.toLowerCase();
}

export function parseSetupLogo(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string' || value.length > 65_600)
    throw new BadRequestException('Logo en fazla 48 KiB olmalıdır.');
  const parts =
    /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!parts) throw new BadRequestException('PNG, JPEG veya WebP logo seçin.');
  const bytes = Buffer.from(parts[2], 'base64');
  if (
    !bytes.length ||
    bytes.length > 49_152 ||
    bytes.toString('base64') !== parts[2]
  )
    throw new BadRequestException('Geçersiz logo verisi.');
  const png = bytes
    .subarray(0, 8)
    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp =
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP';
  if (!{ png, jpeg, webp }[parts[1]])
    throw new BadRequestException('Logo türü dosya içeriğiyle eşleşmiyor.');
  return value;
}

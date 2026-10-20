import type { CSSProperties } from 'react';

export type ClubBranding = {
  logo?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
};
export const defaultClubColors = {
  primaryColor: '#0878ed',
  secondaryColor: '#0a203b',
};
const valid = (value: unknown): value is string =>
  typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
function rgb(hex: string) {
  return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
}
function mix(hex: string, white: number) {
  return (
    '#' +
    rgb(hex)
      .map((value) =>
        Math.round(value * (1 - white) + 255 * white)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}
function luminance(hex: string) {
  const values = rgb(hex).map((channel) => {
    const v = channel / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
export function colorContrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
function readableOnWhite(hex: string) {
  let color = hex;
  while (colorContrast(color, '#ffffff') < 4.5) {
    color =
      '#' +
      rgb(color)
        .map((v) =>
          Math.floor(v * 0.9)
            .toString(16)
            .padStart(2, '0'),
        )
        .join('');
  }
  return color;
}
export function clubTheme(branding?: ClubBranding | null): CSSProperties {
  const primary = valid(branding?.primaryColor)
    ? branding.primaryColor
    : defaultClubColors.primaryColor;
  const secondary = valid(branding?.secondaryColor)
    ? branding.secondaryColor
    : defaultClubColors.secondaryColor;
  const foreground =
    colorContrast(primary, '#ffffff') >= colorContrast(primary, '#000000')
      ? '#ffffff'
      : '#000000';
  const link = readableOnWhite(primary);
  return {
    '--primary': primary,
    '--primary-foreground': foreground,
    '--blue': link,
    '--blue-dark': readableOnWhite(secondary),
    '--ring': link,
    '--accent': mix(primary, 0.92),
    '--accent-foreground': link,
    '--secondary': mix(secondary, 0.94),
    '--secondary-foreground': readableOnWhite(secondary),
    '--club-primary': primary,
    '--club-on-primary': foreground,
    '--club-secondary': secondary,
    '--club-secondary-text': readableOnWhite(secondary),
    '--club-secondary-surface': mix(secondary, 0.94),
    '--club-soft': mix(primary, 0.94),
    '--club-link': link,
  } as CSSProperties;
}

export async function prepareClubLogo(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
    throw new Error('PNG, JPEG veya WebP dosyası seçin.');
  if (!file.size || file.size > 2 * 1024 * 1024)
    throw new Error('Logo dosyası en fazla 2 MiB olabilir.');
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('Logo açılamadı. Başka bir görsel seçin.');
  }
  try {
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Logo önizlemesi hazırlanamadı.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.9, 0.75, 0.55]) {
      const data = canvas.toDataURL('image/webp', quality);
      if (data.startsWith('data:image/webp;base64,') && data.length <= 65_559)
        return data;
    }
    throw new Error(
      'Logo çok ayrıntılı. Daha sade veya küçük bir görsel seçin.',
    );
  } finally {
    bitmap.close();
  }
}

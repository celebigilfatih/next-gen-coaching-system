import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { clubTheme, colorContrast, prepareClubLogo } from './club-branding';
import { useClubTheme } from './use-club-theme';

describe('derived club branding', () => {
  it.each([
    '#ffffff',
    '#000000',
    '#ffcc00',
    '#ff0000',
    '#0878ed',
    '#777777',
    '#00ff00',
  ])('keeps button/link text readable for %s', (color) => {
    const theme = clubTheme({
      primaryColor: color,
      secondaryColor: '#ffffff',
    }) as Record<string, string>;
    expect(
      colorContrast(theme['--primary'], theme['--primary-foreground']),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      colorContrast(theme['--club-link'], '#ffffff'),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      colorContrast(theme['--club-secondary-text'], '#ffffff'),
    ).toBeGreaterThanOrEqual(4.5);
    expect(theme['--destructive']).toBeUndefined();
  });
  it('switches club colors and removes overrides on empty scope and logout', () => {
    const { rerender, unmount } = renderHook(
      ({ color }: { color?: string }) =>
        useClubTheme(
          color
            ? { primaryColor: color, secondaryColor: '#ffffff' }
            : undefined,
        ),
      { initialProps: { color: '#ffcc00' as string | undefined } },
    );
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe(
      '#ffcc00',
    );
    act(() => rerender({ color: '#112233' }));
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe(
      '#112233',
    );
    act(() => rerender({ color: undefined }));
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe(
      '',
    );
    expect(document.documentElement.dataset.clubTheme).toBeUndefined();
    unmount();
  });
  it('rejects SVG and oversized images before decoding/uploading', async () => {
    await expect(
      prepareClubLogo(
        new File(['<svg/>'], 'logo.svg', { type: 'image/svg+xml' }),
      ),
    ).rejects.toThrow('PNG');
    await expect(
      prepareClubLogo(
        new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'large.png', {
          type: 'image/png',
        }),
      ),
    ).rejects.toThrow('2 MiB');
  });
});

import { useEffect } from 'react';
import { clubTheme, type ClubBranding } from './club-branding';

export function useClubTheme(branding?: ClubBranding) {
  const primaryColor = branding?.primaryColor;
  const secondaryColor = branding?.secondaryColor;
  useEffect(() => {
    if (!primaryColor || !secondaryColor) return;
    const root = document.documentElement;
    const previousFlag = root.dataset.clubTheme;
    const previous = new Map<string, string>();
    for (const [key, value] of Object.entries(
      clubTheme({ primaryColor, secondaryColor }),
    )) {
      previous.set(key, root.style.getPropertyValue(key));
      root.style.setProperty(key, String(value));
    }
    root.dataset.clubTheme = 'true';
    return () => {
      for (const [key, value] of previous) {
        if (value) root.style.setProperty(key, value);
        else root.style.removeProperty(key);
      }
      if (previousFlag === undefined) delete root.dataset.clubTheme;
      else root.dataset.clubTheme = previousFlag;
    };
  }, [primaryColor, secondaryColor]);
}

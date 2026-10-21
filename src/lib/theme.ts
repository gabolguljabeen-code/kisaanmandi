import { getStoredTheme, setStoredTheme } from './storage.ts';

export function applyTheme(theme?: 'system' | 'light' | 'dark') {
  const currentTheme = theme || getStoredTheme();
  const root = document.documentElement;

  if (currentTheme === 'dark') {
    root.classList.add('dark');
  } else if (currentTheme === 'light') {
    root.classList.remove('dark');
  } else {
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  if (theme) {
    setStoredTheme(theme);
  }
}

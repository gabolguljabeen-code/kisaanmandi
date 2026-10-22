import { getStoredTheme, setStoredTheme } from './storage.ts';

export function applyTheme(theme?: 'system' | 'light' | 'dark') {
  const currentTheme = theme || getStoredTheme();
  const root = typeof document !== 'undefined' ? document.documentElement : null;
  const body = typeof document !== 'undefined' ? document.body : null;

  if (!root) return;

  if (currentTheme === 'dark') {
    root.classList.add('dark');
    body?.classList.add('dark');
  } else if (currentTheme === 'light') {
    root.classList.remove('dark');
    body?.classList.remove('dark');
  } else {
    // system
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
      body?.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body?.classList.remove('dark');
    }
  }

  if (theme) {
    setStoredTheme(theme);
  }
}

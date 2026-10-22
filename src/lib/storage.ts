import { Crop, TodayPriceRow, User } from '../../shared/types.ts';

const KEY_USER_ID = 'kisan_user_id';
const KEY_USER = 'kisan_user';
const KEY_THEME = 'kisan_theme';
const KEY_WATCHLIST = 'kisan_watchlist';
const KEY_CACHED_PRICES = 'kisan_cached_prices';
const KEY_CACHED_CROPS = 'kisan_cached_crops';

// In-memory fallback in case localStorage is blocked in cross-origin iframes
const memoryStore = new Map<string, string>();

export function safeGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // restricted iframe storage access fallback
  }
  return memoryStore.get(key) ?? null;
}

export function safeSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // restricted iframe storage access fallback
  }
  memoryStore.set(key, value);
}

export function safeRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // restricted iframe storage access fallback
  }
  memoryStore.delete(key);
}

export function getStoredUserId(): string | null {
  const directId = safeGet(KEY_USER_ID);
  if (directId) return directId;
  const user = getStoredUser();
  if (user?.id) return user.id;
  return 'u1';
}

export function setStoredUserId(id: string) {
  safeSet(KEY_USER_ID, id);
}

export function getStoredUser(): User | null {
  const raw = safeGet(KEY_USER);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // ignore
    }
  }
  const defaultFarmer: User = {
    id: 'u1',
    name: 'Ali Demo',
    phone: '03000000001',
    district: 'Sukkur',
    role: 'Farmer',
    created_at: '2026-10-01T08:00:00Z',
  };
  return defaultFarmer;
}

export function setStoredUser(user: User) {
  safeSet(KEY_USER, JSON.stringify(user));
  setStoredUserId(user.id);
}

export function clearUserSession() {
  safeRemove(KEY_USER_ID);
  safeRemove(KEY_USER);
}

export function getStoredWatchlist(): string[] {
  const raw = safeGet(KEY_WATCHLIST);
  if (!raw) return ['c1', 'c3']; // default wheat and onion
  try {
    return JSON.parse(raw);
  } catch {
    return ['c1', 'c3'];
  }
}

export function setStoredWatchlist(ids: string[]) {
  safeSet(KEY_WATCHLIST, JSON.stringify(ids));
}

export function toggleWatchlistCrop(cropId: string): string[] {
  const current = getStoredWatchlist();
  let updated: string[];
  if (current.includes(cropId)) {
    updated = current.filter((id) => id !== cropId);
  } else {
    updated = [...current, cropId];
  }
  setStoredWatchlist(updated);
  return updated;
}

export function getCachedPrices(): TodayPriceRow[] | null {
  const raw = safeGet(KEY_CACHED_PRICES);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCachedPrices(data: TodayPriceRow[]) {
  safeSet(KEY_CACHED_PRICES, JSON.stringify(data));
}

export function getCachedCrops(): Crop[] | null {
  const raw = safeGet(KEY_CACHED_CROPS);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCachedCrops(data: Crop[]) {
  safeSet(KEY_CACHED_CROPS, JSON.stringify(data));
}

export function getStoredTheme(): 'system' | 'light' | 'dark' {
  return (safeGet(KEY_THEME) as 'system' | 'light' | 'dark') || 'system';
}

export function setStoredTheme(theme: 'system' | 'light' | 'dark') {
  safeSet(KEY_THEME, theme);
}

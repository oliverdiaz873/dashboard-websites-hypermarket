type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function getStorageItem<T>(
  key: string,
  storage: StorageLike = window.localStorage,
): T | null {
  try {
    const raw = storage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

export function setStorageItem<T>(
  key: string,
  value: T,
  storage: StorageLike = window.localStorage,
): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage no disponible o cuota superada: falla silenciosamente.
  }
}

export function removeStorageItem(key: string, storage: StorageLike = window.localStorage): void {
  try {
    storage.removeItem(key);
  } catch {
    // Noop.
  }
}

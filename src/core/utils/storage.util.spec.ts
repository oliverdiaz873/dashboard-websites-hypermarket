import { getStorageItem, removeStorageItem, setStorageItem } from './storage.util';

function createMockStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

describe('storage util', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createMockStorage();
  });

  it('serializa y deserializa valores JSON', () => {
    setStorageItem('key', { a: 1 }, storage);
    expect(getStorageItem<{ a: number }>('key', storage)).toEqual({ a: 1 });
  });

  it('devuelve null para claves inexistentes', () => {
    expect(getStorageItem('missing', storage)).toBeNull();
  });

  it('devuelve null ante JSON inválido', () => {
    storage.setItem('bad', '{invalid');
    expect(getStorageItem('bad', storage)).toBeNull();
  });

  it('elimina claves', () => {
    setStorageItem('key', 1, storage);
    removeStorageItem('key', storage);
    expect(getStorageItem('key', storage)).toBeNull();
  });
});

import { environment } from '@env/environment';

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
] as const;

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Resuelve la imagen de un producto a una URL visualizable por el Dashboard.
 * - URL absoluta (http/https) -> se usa tal cual (el backend devuelve la URL pública).
 * - Key relativa (p. ej. `products/.../x.webp`) -> `<storageBase>/uploads/<key>`,
 *   donde `storageBase` se deriva de `apiBaseUrl` (eliminando el sufijo `/api`).
 *   En dev apunta a `http://localhost:3000`; en prod con `apiBaseUrl` vacío queda
 *   same-origin (`/uploads/...`).
 */
export function resolveDashboardImageUrl(
  image: string | null | undefined,
  apiBaseUrl = environment.apiBaseUrl,
): string | null {
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  const storageBase = apiBaseUrl.endsWith('/api') ? apiBaseUrl.slice(0, -4) : apiBaseUrl;
  const raw = image.startsWith('/') ? image.slice(1) : image;
  return `${storageBase}/uploads/${raw}`;
}

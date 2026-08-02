import { HttpContextToken } from '@angular/common/http';

export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

export const REQUEST_TIMEOUT_MS = new HttpContextToken<number | null>(() => null);

export const RETRY_ATTEMPTS = new HttpContextToken<number | null>(() => null);

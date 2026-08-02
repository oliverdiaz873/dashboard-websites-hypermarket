import type { HttpHeaders, HttpParams } from '@angular/common/http';

export interface ApiRequestOptions {
  params?:
    HttpParams | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
  headers?: HttpHeaders | Record<string, string | string[]>;
  body?: unknown;
  timeoutMs?: number;
  retryAttempts?: number;
  skipLoading?: boolean;
  skipAuth?: boolean;
}

import { HttpClient, HttpContext, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, TimeoutError, map, mergeMap, of, retryWhen, throwError, timeout } from 'rxjs';

import type { ApiResponse } from '../../models/api-response';
import { API_CONFIG } from '../config/api.config';
import type { ApiRequestOptions } from '../models/api-request-options';
import type { PaginatedResponse } from '../../models/paginated-response';
import type { PaginationMeta } from '../../models/paginated-response';
import {
  REQUEST_TIMEOUT_MS,
  RETRY_ATTEMPTS,
  SKIP_AUTH,
  SKIP_LOADING,
} from '../tokens/http-context.tokens';

/**
 * Capa base para consumir el backend Express vía HttpClient.
 *
 * - Recibe rutas relativas (p. ej. `/products`) y antepone `API_CONFIG.baseUrl`.
 * - Desempaqueta la respuesta `{ success, data }` y expone solo `data`.
 * - Los errores se propagan como `ApiError` (normalizados por el ErrorInterceptor).
 * - `timeout`/`retry` se aplican por petición con los defaults de `API_CONFIG`.
 */
@Injectable({ providedIn: 'root' })
export class BaseApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);

  protected get<T>(path: string, options: ApiRequestOptions = {}): Observable<T> {
    return this.request<T>('GET', path, options);
  }

  protected post<T>(path: string, body?: unknown, options: ApiRequestOptions = {}): Observable<T> {
    return this.request<T>('POST', path, { ...options, body });
  }

  protected put<T>(path: string, body?: unknown, options: ApiRequestOptions = {}): Observable<T> {
    return this.request<T>('PUT', path, { ...options, body });
  }

  protected patch<T>(path: string, body?: unknown, options: ApiRequestOptions = {}): Observable<T> {
    return this.request<T>('PATCH', path, { ...options, body });
  }

  protected delete<T = void>(path: string, options: ApiRequestOptions = {}): Observable<T> {
    return this.request<T>('DELETE', path, options);
  }

  /**
   * Variante paginada de `get`: además de desempaquetar `data`, expone el
   * objeto `pagination` (`{ page, limit, total, pages }`). Pensada para
   * listados server-side (Products, y futuros Orders/Users/Inventory).
   */
  protected getPaginated<T>(
    path: string,
    options: ApiRequestOptions = {},
  ): Observable<PaginatedResponse<T>> {
    return this.request<PaginatedResponse<T>>('GET', path, options, { keepPagination: true });
  }

  protected buildUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;
    return `${this.apiConfig.baseUrl}${path}`;
  }

  private request<T>(
    method: string,
    path: string,
    { body, params, headers, timeoutMs, retryAttempts, skipLoading, skipAuth }: ApiRequestOptions,
    flags: { keepPagination?: boolean } = {},
  ): Observable<T> {
    const requestTimeoutMs = timeoutMs ?? this.apiConfig.timeoutMs;
    const requestRetryAttempts = retryAttempts ?? this.apiConfig.retryAttempts;

    const context = new HttpContext()
      .set(SKIP_LOADING, skipLoading ?? false)
      .set(SKIP_AUTH, skipAuth ?? false)
      .set(REQUEST_TIMEOUT_MS, requestTimeoutMs)
      .set(RETRY_ATTEMPTS, requestRetryAttempts);

    const paramsValue =
      params instanceof HttpParams ? params : new HttpParams({ fromObject: params ?? {} });

    const request$ = this.http.request<ApiResponse<T>>(method, this.buildUrl(path), {
      body,
      params: paramsValue,
      headers: headers ?? this.apiConfig.defaultHeaders,
      context,
      observe: 'body',
    });

    // Retry SOLO en GET (idempotente) y únicamente ante fallos transitorios de
    // red/timeout. Nunca reintentamos mutaciones (POST/PUT/PATCH/DELETE) para
    // evitar duplicados o inconsistencias.
    //
    // Se usa `retryWhen` (no `retry`) porque en RxJS 7 el operador `retry` no
    // acepta un filtro por error: habría reintentado incluso respuestas HTTP
    // 4xx/5xx. Aquí decidimos por error si re-disparar o propagar.
    const retried$ =
      method === 'GET' && requestRetryAttempts > 0
        ? request$.pipe(
            retryWhen((errors) =>
              errors.pipe(
                mergeMap((error: unknown, attempt: number) =>
                  attempt < requestRetryAttempts && isRetryable(error)
                    ? of(error)
                    : throwError(() => error),
                ),
              ),
            ),
          )
        : request$;

    return retried$.pipe(
      timeout(requestTimeoutMs),
      map((response) => {
        if (flags?.keepPagination) {
          const { pagination } = response as ApiResponse<T> & { pagination: PaginationMeta };
          return { data: response?.data, pagination } as T;
        }
        return response?.data as T;
      }),
    );
  }
}

function isRetryable(error: unknown): boolean {
  if (error instanceof TimeoutError) return true;
  if (error instanceof HttpErrorResponse) return error.status === 0;
  return false;
}

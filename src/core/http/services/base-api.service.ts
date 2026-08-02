import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, retry, timeout } from 'rxjs';

import type { ApiResponse } from '../../models/api-response';
import { API_CONFIG } from '../config/api.config';
import type { ApiRequestOptions } from '../models/api-request-options';
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

  protected buildUrl(path: string): string {
    return `${this.apiConfig.baseUrl}${path}`;
  }

  private request<T>(
    method: string,
    path: string,
    { body, params, headers, timeoutMs, retryAttempts, skipLoading, skipAuth }: ApiRequestOptions,
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

    const request$ = this.http
      .request<ApiResponse<T>>(method, this.buildUrl(path), {
        body,
        params: paramsValue,
        headers: headers ?? this.apiConfig.defaultHeaders,
        context,
        observe: 'body',
      })
      .pipe(retry(requestRetryAttempts));

    return request$.pipe(
      timeout(requestTimeoutMs),
      map((response) => response?.data as T),
    );
  }
}

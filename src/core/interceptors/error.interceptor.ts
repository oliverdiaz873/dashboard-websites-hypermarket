import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { API_ENDPOINTS } from '../http/endpoints';
import { NOTIFICATION_TYPE } from '../enums/notification-type';
import type { ApiError } from '../models/api-error';
import { isApiError } from '../models/api-error';
import { AuthStore } from '../state/auth/auth.store';
import { NotificationsStore } from '../state/notifications/notifications.store';

/**
 * Normaliza los errores HTTP a `ApiError`, los notifica en el NotificationsStore
 * y los re-lanza para que los callers los reciban tipados.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationsStore = inject(NotificationsStore);
  const authStore = inject(AuthStore);

  return next(req).pipe(
    catchError((error: unknown) => {
      const apiError = toApiError(error);

      // Sesión inválida/expirada (401) en cualquier petición salvo el propio login.
      // No navegamos aquí: eso es decisión del guard. Solo limpiamos el estado.
      if (apiError.statusCode === 401 && !req.url.includes(`${API_ENDPOINTS.auth}/login`)) {
        authStore.logout();
      }

      notificationsStore.add({
        type: NOTIFICATION_TYPE.ERROR,
        message: apiError.message,
        title: defaultTitleForStatus(apiError.statusCode),
      });
      return throwError(() => apiError);
    }),
  );
};

function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (error instanceof HttpErrorResponse) {
    const body = error.error as { message?: string } | null;
    return {
      success: false,
      message: body?.message || defaultMessageForStatus(error.status),
      statusCode: error.status,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    success: false,
    message: error instanceof Error ? error.message : 'Unexpected error',
    statusCode: 0,
    timestamp: new Date().toISOString(),
  };
}

function defaultMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Solicitud inválida';
    case 401:
      return 'No autorizado';
    case 403:
      return 'Acceso denegado';
    case 404:
      return 'Recurso no encontrado';
    case 409:
      return 'Conflicto con el recurso';
    case 408:
      return 'La solicitud expiró';
    default:
      return 'Error del servidor';
  }
}

function defaultTitleForStatus(status: number): string | undefined {
  return status === 408 ? 'Tiempo de espera agotado' : undefined;
}

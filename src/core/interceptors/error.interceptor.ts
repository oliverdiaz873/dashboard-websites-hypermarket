import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { API_ENDPOINTS } from '../http/endpoints';
import { NOTIFICATION_TYPE } from '../enums/notification-type';
import type { ApiError } from '../models/api-error';
import { isApiError } from '../models/api-error';
import { AuthStore } from '../state/auth/auth.store';
import { NotificationsStore } from '../state/notifications/notifications.store';

const SESSION_EXPIRED_MESSAGE = 'Tu sesión expiró. Inicia sesión de nuevo.';

/**
 * Normaliza los errores HTTP a `ApiError`, los notifica en el NotificationsStore
 * y los re-lanza para que los callers los reciban tipados.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationsStore = inject(NotificationsStore);
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      const apiError = toApiError(error);
      const isLoginRequest = req.url.includes(`${API_ENDPOINTS.auth}/login`);

      // Sesión inválida/expirada (401) en cualquier petición salvo el propio
      // login: limpiamos el estado, redirigimos a /login con la URL de destino y
      // avisamos al usuario. Evitamos redirigir si ya estamos en /login.
      if (apiError.statusCode === 401 && !isLoginRequest) {
        authStore.logout();
        if (!router.url.startsWith('/login')) {
          void router
            .navigate(['/login'], { queryParams: { returnUrl: router.url } })
            .catch(() => undefined);
        }
        notificationsStore.add({
          type: NOTIFICATION_TYPE.ERROR,
          message: SESSION_EXPIRED_MESSAGE,
        });
        return throwError(() => apiError);
      }

      // Incluimos el requestId de backend en la notificación para poder rastrear
      // el error en los logs del servidor.
      const message = apiError.requestId
        ? `${apiError.message} (Request ${apiError.requestId})`
        : apiError.message;

      notificationsStore.add({
        type: NOTIFICATION_TYPE.ERROR,
        message,
        title: defaultTitleForStatus(apiError.statusCode),
      });
      return throwError(() => apiError);
    }),
  );
};

function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (error instanceof HttpErrorResponse) {
    const body = error.error as {
      message?: string;
      statusCode?: number;
      code?: string;
      requestId?: string;
    } | null;
    const statusCode = body?.statusCode ?? error.status;
    return {
      success: false,
      message: body?.message || defaultMessageForStatus(statusCode),
      statusCode,
      code: body?.code,
      requestId: body?.requestId,
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
    case 0:
      return 'No hay conexión con el servidor';
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

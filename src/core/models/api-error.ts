export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  timestamp?: string;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as ApiError).success === false &&
    typeof (error as ApiError).message === 'string' &&
    typeof (error as ApiError).statusCode === 'number'
  );
}

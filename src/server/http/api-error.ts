export type ApiErrorCode =
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "BAD_REQUEST"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details?: unknown;

  constructor(status: number, code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static notFound(message = "Recurso no encontrado.") {
    return new ApiError(404, "NOT_FOUND", message);
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, "BAD_REQUEST", message, details);
  }

  static validation(message = "Datos no validos.", details?: unknown) {
    return new ApiError(400, "VALIDATION_ERROR", message, details);
  }

  static internal(message = "Error interno del servidor.") {
    return new ApiError(500, "INTERNAL_ERROR", message);
  }
}

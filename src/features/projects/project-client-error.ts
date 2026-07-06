export type ProjectClientErrorCode = "API_ERROR" | "NOT_FOUND" | "VALIDATION_ERROR" | "INTERNAL_ERROR";

export class ProjectClientError extends Error {
  readonly status: number;
  readonly code: ProjectClientErrorCode;

  constructor(status: number, code: ProjectClientErrorCode, message: string) {
    super(message);
    this.name = "ProjectClientError";
    this.status = status;
    this.code = code;
  }
}

type ApiErrorBody = {
  error?: string;
  code?: string;
};

export async function parseApiResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  let body: ApiErrorBody = {};
  try {
    body = await response.json() as ApiErrorBody;
  } catch {
    body = {};
  }

  const message = body.error ?? `API ${response.status}`;
  const code = body.code === "NOT_FOUND"
    ? "NOT_FOUND"
    : body.code === "VALIDATION_ERROR"
      ? "VALIDATION_ERROR"
      : body.code === "INTERNAL_ERROR"
        ? "INTERNAL_ERROR"
        : "API_ERROR";

  throw new ProjectClientError(response.status, code, message);
}

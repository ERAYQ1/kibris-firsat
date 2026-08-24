export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const Errors = {
  unauthorized: () =>
    new AppError(401, "unauthorized", "Bu işlem için giriş yapmalısınız."),
  authFailed: () =>
    new AppError(401, "auth_failed", "E-posta veya şifre hatalı."),
  forbidden: () =>
    new AppError(403, "forbidden", "Bu işlem için yetkiniz yok."),
  notFound: (what = "Kayıt") =>
    new AppError(404, "not_found", `${what} bulunamadı.`),
  conflict: (message: string) => new AppError(409, "conflict", message),
  badRequest: (message: string) => new AppError(400, "bad_request", message),
  validation: (message: string) =>
    new AppError(422, "validation_error", message),
};

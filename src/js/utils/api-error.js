export class ApiError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    
    // Сохраняет правильный stack trace (для V8 движков)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
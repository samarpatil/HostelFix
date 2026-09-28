// Throw `new AppError('Complaint not found', 404)` from any controller and
// the centralized error handler will turn it into the right HTTP response.
// Anything else (a typo, a null-pointer bug) falls through as a 500 instead
// of accidentally leaking a stack trace or the wrong status code.

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

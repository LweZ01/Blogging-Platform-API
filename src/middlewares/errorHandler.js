class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

function errorHandler(err, req, res, next) {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : "An internal server error has occurred";

  res.status(statusCode).json({
    error: message,
  });
}

export { errorHandler, AppError };

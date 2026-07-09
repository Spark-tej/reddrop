export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || "Internal server error";

  if (process.env.NODE_ENV === "production") {
    if (statusCode >= 500) {
      console.error("Unhandled error:", message);
    }

    return res.status(statusCode).json({
      message: statusCode >= 500 ? "Internal server error" : message,
    });
  }

  return res.status(statusCode).json({
    message,
    stack: err.stack,
  });
};

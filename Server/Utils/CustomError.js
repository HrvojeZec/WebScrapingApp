class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.status = statusCode >= 400 && statusCode < 500 ? "fails" : "error";
    this.statusCode = statusCode;
  }
}

module.exports = CustomError;

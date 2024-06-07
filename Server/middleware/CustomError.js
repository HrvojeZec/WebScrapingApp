const httpStatus = require("../constants/httpResponseStauts");

class CustomError extends Error {
  constructor({ message, name, statusCode, data }) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.data = data;
    Error.captureStackTrace(this, CustomError);
  }
}
class CustomBadRequest extends CustomError {
  constructor(message = "Bad request", data) {
    super({
      message,
      name: "HttpBadRequest",
      statusCode: httpStatus.BAD_REQUEST,
      data,
    });
  }
}

class CustomNotFound extends CustomError {
  constructor(message = "Not Found", data) {
    super({
      message,
      name: "HttpNotFound",
      statusCode: httpStatus.NOT_FOUND,
      data,
    });
  }
}

class CustomInternalServerError extends CustomError {
  constructor(message = "Internal server error", data) {
    super({
      message,
      name: "HttpInternalServerError",
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      data,
    });
  }
}

class CustomMultiStatus extends CustomError {
  constructor(message = "Multi-Status", data) {
    super({
      message,
      name: "HttpMultiStatus",
      statusCode: httpStatus.MULTI_STATUS,
      data,
    });
  }
}
module.exports = {
  CustomError,
  CustomBadRequest,
  CustomNotFound,
  CustomInternalServerError,
  CustomMultiStatus,
};

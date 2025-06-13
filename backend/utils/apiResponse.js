/**
 * Standardized API response utility
 */

class ApiResponse {
  constructor(success, message, data = null, statusCode = 200, errors = null) {
    this.success = success;
    this.message = message;
    this.statusCode = statusCode;
    
    if (data !== null) {
      this.data = data;
    }
    
    if (errors !== null) {
      this.errors = errors;
    }
    
    // Add timestamp
    this.timestamp = new Date().toISOString();
  }

  // Success responses
  static success(message, data = null, statusCode = 200) {
    return new ApiResponse(true, message, data, statusCode);
  }

  static created(message, data = null) {
    return new ApiResponse(true, message, data, 201);
  }

  // Error responses
  static error(message, errors = null, statusCode = 500) {
    return new ApiResponse(false, message, null, statusCode, errors);
  }

  static badRequest(message, errors = null) {
    return new ApiResponse(false, message, null, 400, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiResponse(false, message, null, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiResponse(false, message, null, 403);
  }

  static notFound(message = 'Resource not found') {
    return new ApiResponse(false, message, null, 404);
  }

  static conflict(message = 'Conflict') {
    return new ApiResponse(false, message, null, 409);
  }

  static validationError(message, errors) {
    return new ApiResponse(false, message, null, 422, errors);
  }

  // Send response
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      ...(this.data !== undefined && { data: this.data }),
      ...(this.errors !== undefined && { errors: this.errors }),
      timestamp: this.timestamp
    });
  }
}

// Pagination helper
class PaginatedResponse extends ApiResponse {
  constructor(success, message, data, pagination, statusCode = 200) {
    super(success, message, data, statusCode);
    this.pagination = pagination;
  }

  static success(message, data, pagination) {
    return new PaginatedResponse(true, message, data, pagination, 200);
  }

  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
      pagination: this.pagination,
      timestamp: this.timestamp
    });
  }
}

// Async handler wrapper to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  ApiResponse,
  PaginatedResponse,
  asyncHandler
};

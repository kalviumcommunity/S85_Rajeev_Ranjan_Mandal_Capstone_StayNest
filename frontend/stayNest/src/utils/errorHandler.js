/**
 * Frontend error handling utilities
 */

// Error types
export const ERROR_TYPES = {
  NETWORK: "NETWORK_ERROR",
  VALIDATION: "VALIDATION_ERROR",
  AUTHENTICATION: "AUTHENTICATION_ERROR",
  AUTHORIZATION: "AUTHORIZATION_ERROR",
  NOT_FOUND: "NOT_FOUND_ERROR",
  SERVER: "SERVER_ERROR",
  UNKNOWN: "UNKNOWN_ERROR",
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: "Network error. Please check your internet connection.",
  VALIDATION: "Please check your input and try again.",
  AUTHENTICATION: "Please log in to continue.",
  AUTHORIZATION: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER: "Something went wrong on our end. Please try again later.",
  UNKNOWN: "An unexpected error occurred. Please try again.",
};

/**
 * Parse error from API response
 */
export const parseError = (error) => {
  // Network error
  if (!error.response) {
    return {
      type: ERROR_TYPES.NETWORK,
      message: ERROR_MESSAGES.NETWORK,
      details: error.message,
    };
  }

  const { status, data } = error.response;

  // Extract error message from response
  const message = data?.message || data?.error || ERROR_MESSAGES.UNKNOWN;
  const errors = data?.errors || null;

  switch (status) {
    case 400:
      return {
        type: ERROR_TYPES.VALIDATION,
        message: message || ERROR_MESSAGES.VALIDATION,
        errors,
      };

    case 401:
      return {
        type: ERROR_TYPES.AUTHENTICATION,
        message: message || ERROR_MESSAGES.AUTHENTICATION,
        errors,
      };

    case 403:
      return {
        type: ERROR_TYPES.AUTHORIZATION,
        message: message || ERROR_MESSAGES.AUTHORIZATION,
        errors,
      };

    case 404:
      return {
        type: ERROR_TYPES.NOT_FOUND,
        message: message || ERROR_MESSAGES.NOT_FOUND,
        errors,
      };

    case 422:
      return {
        type: ERROR_TYPES.VALIDATION,
        message: message || ERROR_MESSAGES.VALIDATION,
        errors,
      };

    case 500:
    default:
      return {
        type: ERROR_TYPES.SERVER,
        message: message || ERROR_MESSAGES.SERVER,
        errors,
      };
  }
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors) => {
  if (!errors || !Array.isArray(errors)) {
    return {};
  }

  return errors.reduce((acc, error) => {
    if (error.field) {
      acc[error.field] = error.message;
    }
    return acc;
  }, {});
};

/**
 * Show user-friendly error message
 */
export const getDisplayMessage = (error) => {
  const parsedError = parseError(error);
  return parsedError.message;
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error) => {
  const parsedError = parseError(error);
  return [ERROR_TYPES.NETWORK, ERROR_TYPES.SERVER].includes(parsedError.type);
};

/**
 * Log error for debugging
 */
export const logError = (error, context = "") => {
  if (process.env.NODE_ENV === "development") {
    console.group(`🚨 Error ${context ? `in ${context}` : ""}`);
    console.error("Original error:", error);
    console.error("Parsed error:", parseError(error));
    console.groupEnd();
  }
};

/**
 * Error boundary fallback component
 */
export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 text-center mb-6">
          We're sorry, but something unexpected happened. Please try refreshing
          the page.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={resetErrorBoundary}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
          >
            Go home
          </button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-500">
              Error details (dev only)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

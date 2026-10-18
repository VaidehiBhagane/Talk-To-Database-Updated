/**
 * Utility function to generate user-friendly error messages based on HTTP status codes
 * @param {Error} err - The error object from axios catch block
 * @param {string} defaultMessage - Optional default message if status code not matched
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (err, defaultMessage = 'Something went wrong. Please try again.') => {
  // Check if it's a network error (no response from server)
  if (!err.response) {
    return 'Cannot reach server. Check your connection.';
  }

  // Get the HTTP status code
  const status = err.response.status;

  // Check for server-provided error message first
  const serverMessage = err.response?.data?.error || err.response?.data?.message;

  // Return status-specific messages
  switch (status) {
    case 401:
      return 'Session expired. Please login again.';
    case 403:
      return serverMessage || "You don't have access to this department.";
    case 404:
      return serverMessage || 'Requested resource not found.';
    case 500:
      return 'Server error. Please try again in a moment.';
    case 502:
    case 503:
    case 504:
      return 'Server is temporarily unavailable. Please try again later.';
    default:
      // Use server message if available, otherwise use default
      return serverMessage || defaultMessage;
  }
};

/**
 * Check if error is an authentication error (401) that requires re-login
 * @param {Error} err - The error object from axios catch block
 * @returns {boolean} True if user should be redirected to login
 */
export const isAuthError = (err) => {
  return err.response && err.response.status === 401;
};

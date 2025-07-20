// Shared type definitions for Spot-a-John

/**
 * User object structure
 */
export const UserTypes = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
};

/**
 * API Response structure
 */
export class ApiResponse {
  constructor(success, data, message = '', error = null) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }

  static success(data, message = '') {
    return new ApiResponse(true, data, message);
  }

  static error(message, error = null) {
    return new ApiResponse(false, null, message, error);
  }
}

/**
 * Validation schemas
 */
export const ValidationSchemas = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
}; 
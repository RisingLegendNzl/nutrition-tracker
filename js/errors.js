// Error definitions and utilities for the Nutrify application.

export class AppError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AppError';
  }
}

export default {
  AppError,
};
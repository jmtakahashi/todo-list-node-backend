/* ExpressError extends normal JS error */
class ExpressError extends Error {
  constructor(message, status) {
    super();
    this.message = message;
    this.status = status;
  }
}

/* 400 BAD REQUEST error.  Improper request data. */
class BadRequestError extends ExpressError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

/* 401 UNAUTHORIZED error.  No credentials provided or invalid credentials. */
class UnauthorizedError extends ExpressError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/* 403 FORBIDDEN error.  Credentials provided but not authorized for the resource. */
class ForbiddenError extends ExpressError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/* 404 NOT FOUND error.  Resource not found. */
class NotFoundError extends ExpressError {
  constructor(message = 'Not found') {
    super(message, 404);
  }
}

/* 409 DUPLICATE CONTENT error. */
class DuplicateContentError extends ExpressError {
  constructor(message = 'Duplicate content') {
    super(message, 404);
  }
}

module.exports = {
  ExpressError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ForbiddenError,
  DuplicateContentError,
};

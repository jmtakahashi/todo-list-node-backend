const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../utils/expressError');
const { ACCESS_TOKEN_SECRET_KEY, REFRESH_TOKEN_SECRET_KEY } = require('../config/config');


// checks for token, adds payload to req.user if exists.  DOES NOT THROW ERROR.
const authenticateJWT = (req, res, next) => {
  try {
    // access token will come in the Authorization header in the format "Bearer <token>"
    // token will contain id and username in the payload
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader) {
      const accessToken = authHeader.split(' ')[1]; // extract token from Authorization header
      const { id, username, isAdmin } = jwt.verify(accessToken, ACCESS_TOKEN_SECRET_KEY); // this will throw an error if the token is invalid or expired
      req.user = { id, username, isAdmin };
    }

    return next();
  } catch (error) {
    // console.error('In authenticateJWT middleware: ', error.message);
    // do not throw an error and continue.  subsequent middleware will run checks for auth
    return next();
  }
};


// authenticate refresh token
const authenticateRefreshToken = (req, res, next) => {
  const refreshToken = req.cookies.refreshToken; // Get the refresh token from the cookie

  if (!refreshToken) {
    // console.error('In authenticateRefreshToken error:'.red, 'No refresh token provided.');
    const e = new UnauthorizedError('No refresh token provided.');
    return next(e);
  }

  try {
    const { id } = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET_KEY); // this will throw an error if the token is invalid or expired
    
    req.user = { id };
    
    return next();
  } catch (error) {
    // console.error('In authenticateRefreshToken middleware: '.red, error.message);
    // pass on to the error handler
    const e = new UnauthorizedError('Invalid or expired refresh token.');
    return next(e);
  }
}


// return 401 if no logged in user (no user on the req object)
const requireLoggedIn = (req, res, next) => {
  // if authenticateJWT failed, { id, username } won't exist on the req, return a 401
  if (!req.user) {
    const e = new UnauthorizedError("You must be logged in to access this resource.");
    return next(e);
  }

  return next();
}


// return 401 if the user is not the correct user
const requireCorrectUser = (req, res, next) => {
  // req.user will have { id, username } OR undefined
  const paramsUserId = req.params.userId;
  const jwtUserId = req.user.id

  if (jwtUserId !== paramsUserId) {
    const e = new ForbiddenError("You are not authorized to access this resource.");
    return next(e)
  }

  return next();
};


// return 401 if the user is not an admin user
const requireAdmin = (req, res, next) => {
  // req.user will have { id, username, isAdmin } OR undefined
  const isAdmin = req.user.isAdmin

  if (isAdmin === undefined || isAdmin === false) {
    const e = new ForbiddenError("You must be an admin to access this resource.");
    return next(e);
  }

  return next();
};


module.exports = {
  authenticateJWT,
  authenticateRefreshToken,
  requireLoggedIn,
  requireCorrectUser,
  requireAdmin
};

const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET_KEY, REFRESH_TOKEN_SECRET_KEY } = require('../config/config');

const authenticateJWT = (req, res, next) => {
  console.log('running authenticateJWT'.brightCyan)
  try {
    // access token will come in the Authorization header in the format "Bearer <token>"
    // token will contain id and username in the payload
    const authHeader = req.headers.authorization || req.headers.Authorization; // Get the Authorization header from the request
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized. No token provided.' });
    }
    const accessToken = authHeader.split(' ')[1]; // Get the access token from the Authorization header
    const { id, username } = jwt.verify(accessToken, ACCESS_TOKEN_SECRET_KEY); // this will throw an error if the token is invalid or expired
    req.user = { id, username }; // Attach the decoded payload to the request object for use in subsequent middleware or route handlers
    return next();
  } catch (err) {
    err.message = 'From authenticateJWT: ' + err.message;
    console.error('In authenticateJWT error:'.red, err);
    return next();
  }
};

const authenticateRefreshToken = (req, res, next) => {
  console.log('running authenticateRefreshToken'.brightCyan);
  try {
    const refreshToken = req.cookies.refreshToken; // Get the refresh token from the cookie
    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET_KEY); // this will throw an error if the token is invalid or expired
    req.user = { refresh: payload }; // Attach the decoded payload to the request object for use in subsequent middleware or route handlers
    return next();
  } catch (err) {
    err.message = 'From authenticateRefreshToken: ' + err.message;
    console.error('In authenticateRefreshToken error:'.red, err);
    return next()
  }
}

module.exports = {
  authenticateJWT,
  authenticateRefreshToken
};

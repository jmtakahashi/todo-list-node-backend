const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET_KEY } = require('../config/config');

const authenticateJWT = (req, res, next) => {
  try {
    const token = req.cookies.accessToken; // Get the token from the cookie
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET_KEY); // this will throw an error if the token is invalid or expired
    req.user = payload; // Attach the decoded payload to the request object for use in subsequent middleware or route handlers
    return next();
  } catch (err) {
    return next();
  }
};

module.exports = {
  authenticateJWT,
};

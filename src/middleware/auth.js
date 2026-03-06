const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET_KEY } = require('../config/config');

const authenticateJWT = (req, res, next) => {
  try {
    console.log('Cookies: ', req.cookies);
    console.log('Signed Cookies: ', req.signedCookies);
    const token = req.cookies.accessToken; // Get the token from the cookie
    // const token = req.headers.authorization.split(' ')[1]; // Extract the token from the "Bearer <token>" format
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET_KEY);
    req.user = payload; // Attach the decoded payload to the request object for use in subsequent middleware or route handlers
    return next();
  } catch (err) {
    return next();
  }
};

module.exports = {
  authenticateJWT,
};

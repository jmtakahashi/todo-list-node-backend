const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET_KEY, REFRESH_TOKEN_SECRET_KEY } = require('../config/config');

const authenticateJWT = (req, res, next) => {
  try {
    // access token will come in the Authorization header in the format "Bearer <token>"
    // token will contain id and username in the payload
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized. No access token provided.' });
    }

    const accessToken = authHeader.split(' ')[1]; // extract token from Authorization header
    const { id, username } = jwt.verify(accessToken, ACCESS_TOKEN_SECRET_KEY); // this will throw an error if the token is invalid or expired
    req.user = { id, username };
    return next();
  } catch (error) {
    console.error('In authenticateJWT error:'.red, error.message);
    // handle the error here and do NOT pass on to the next handler
    return res.status(403).json({ message: 'Forbidden. Invalid or expired access token.' });
  }
};

const authenticateRefreshToken = (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken; // Get the refresh token from the cookie

    if (!refreshToken) {
      console.error('In authenticateRefreshToken error:'.red, 'No refresh token provided.');
      return res
        .status(401)
        .json({ message: 'Unauthorized. No refresh token provided.' });
    }

    const { id } = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET_KEY); // this will throw an error if the token is invalid or expired
    req.user = { id };
    return next();
  } catch (error) {
    console.error('In authenticateRefreshToken error:'.red, error.message);
    // handle the error here and do NOT pass on to the next handler
    return res.status(403).json({ message: 'Forbidden. Invalid or expired refresh token.' });
  }
}

module.exports = {
  authenticateJWT,
  authenticateRefreshToken
};

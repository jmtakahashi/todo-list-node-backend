const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/config');

const authenticateJWT = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload; // Attach the decoded payload to the request object for use in subsequent middleware or route handlers
    return next();
  } catch (err) {
    return next();
  }
};

module.exports = {
  authenticateJWT,
};

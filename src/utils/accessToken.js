const { SECRET_KEY, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET_KEY, REFRESH_TOKEN_EXPIRY } = require("../config/config");
const jwt = require("jsonwebtoken");

const generateAccessToken = function (payload) {
  return jwt.sign(payload, SECRET_KEY, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    },
  );
};

const generateRefreshToken = function (payload) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    },
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
}
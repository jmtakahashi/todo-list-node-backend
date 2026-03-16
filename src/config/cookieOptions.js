const { path } = require("../app");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'test' ? false : true,
  sameSite: 'Lax', // Allow cross-site cookies (required for secure cookies)
  // maxAge: 24 * 60 * 60 * 1000, // 1 day
  maxAge: 7 * 24 * 60 * 60 * 1000, // same as the refresh token expiry time (7 days)
  path: '/auth/refresh', // only send the refresh token cookie to the /auth/refresh endpoint
};

module.exports = cookieOptions;
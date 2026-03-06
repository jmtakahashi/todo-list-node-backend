const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'None', // Allow cross-site cookies (required for secure cookies)
  // maxAge: 24 * 60 * 60 * 1000, // 1 day
  maxAge: 60 * 60 * 24 // same as the refresh token expiry time so that the cookie will be automatically cleared when the refresh token expires
};

module.exports = cookieOptions;
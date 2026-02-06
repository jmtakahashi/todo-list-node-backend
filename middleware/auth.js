const loggedInOnly = (req, res, next) => {
  try {
    if (!res.locals.user) {
      return res.status(401).json({ error: { message: "Unauthorized", status: 401 } });
    }
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  loggedInOnly,
};
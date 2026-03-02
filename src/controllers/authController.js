const User = require("../models/User");
const { SECRET_KEY } = require('../config/config');
const jwt = require('jsonwebtoken');
// Controller functions that call the corresponding model functions and handle the HTTP responses
// call next to pass control to the next middleware (e.g., error handling) if needed

// return res.status(500).json({ error: 'Database operation failed' });

/**
 Controllers:
	•	Decide how errors map to HTTP
	•	Decide status codes
	•	Decide response shape
   knows nothing about db
 */

  //const token = jwt.sign({ username: user.username }, SECRET_KEY);

const registerUser = async function (req, res, next) {
  const { username, email, password } = req.body;
  
  try {
    const response = await User.register(username, email, password);

    if (response.error) {
      return res.status(400).json(response);
    }

    const token = jwt.sign({ id: response.id }, SECRET_KEY);
    return res.status(201).json(token);
  } catch (error) {
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};

const loginUser = async function (req, res, next) {
  const { email, password } = req.body;

  try {
    const response = await User.login(email, password);

    if (response.error) {
      return res.status(400).json(response);
    }

    const token = jwt.sign({ id: response._id }, SECRET_KEY);
    return res.status(200).json(token);
  } catch (error) {
    next(error); // Pass the error to the next middleware (e.g., error handler) 
  }
};

const logoutUser = async function (req, res) {
  // Since JWTs are stateless, we can't invalidate them server-side.
  // The client should simply delete the token on logout.
  await User.logout(); // This is just a placeholder in case we want to do any server-side cleanup in the future
  return res.json({ message: "Logout successful. Please delete the token on the client side." });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
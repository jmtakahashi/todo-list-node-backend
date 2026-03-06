const User = require("../models/User");
const cookieOptions = require("../config/cookieOptions");
const { generateAccessToken } = require("../utils/accessToken");

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
  
  // make sure all required fields are provided
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  try {
    // check if user with the same email already exists
    const user = await User.getUserByEmail(email);
    if (user) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    // if user with the same email does NOT exist, proceed to register the user
    const response = await User.register(username, email, password);
    // successful response: { id: id, message: 'User registered successfully' }
    const token = generateAccessToken({ id: response.id });
    return res
      .status(201)
      .cookie('accessToken', token, cookieOptions)
      // .cookie('refreshToken', refreshToken)
      .json({ token: token, message: response.message, username: username });
  } catch (error) {
    console.error('In authController registerUser error:', error);
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};

const loginUser = async function (req, res, next) {
  const { email, password } = req.body;

  // make sure all required fields are provided
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Email and password are required' });
  }

  try {
    const response = await User.login(email, password);

    // response will be either { user: {...}, message: 'Login successful' } if successful, 
    // or { message: 'Invalid credentials' }

    if (!response.user) {
      return res.status(401).json({ message: response.message });
    }

    const token = generateAccessToken({ id: response.user._id });
    return res
      .status(200)
      .cookie('accessToken', token, cookieOptions)
      // .cookie("refreshToken", refreshToken)
      .json({
        token: token,
        message: response.message,
        username: response.user.username,
      });
  } catch (error) {
    console.error('In authController loginUser error:', error);
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};;

const logoutUser = async function (req, res) {
  // Since JWTs are stateless, we can't invalidate them server-side.
  // The client should simply delete the token on logout.
  await User.logout(); // This is just a placeholder in case we want to do any server-side cleanup in the future
  return res
    .clearCookie('accessToken')
    // .clearCookie('refreshToken')
    .json({ message: 'Logout successful.' });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
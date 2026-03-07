const User = require("../models/User");
const cookieOptions = require("../config/cookieOptions");
const { generateAccessToken, generateRefreshToken } = require("../services/accessToken");


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
    const accessToken = generateAccessToken({
      id: response.id,
      username: username,
    });
    const refreshToken = generateRefreshToken({ id: response.id});
    return (
      res
        .status(201)
        .cookie('refreshToken', refreshToken, cookieOptions)
        .json({
          accessToken: accessToken,
          message: response.message,
        })
    );
  } catch (error) {
    console.error('In authController registerUser error:', error.message);
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

    const accessToken = generateAccessToken({
      id: response.user._id,
      username: response.user.username,
    });
    const refreshToken = generateRefreshToken({ id: response.user._id });
    return res
      .status(200)
      .cookie('refreshToken', refreshToken, cookieOptions) // set the refresh token as an HTTP-only cookie
      // send the access token in the response body
      .json({
        accessToken: accessToken,
        message: response.message,
      });
  } catch (error) {
    console.error('In authController loginUser error:', error.message);
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};

const logoutUser = async function (req, res, next) {
  // Since JWTs are stateless, we can't invalidate them server-side.
  // The client should simply delete the token on logout.
  await User.logout(); // This is just a placeholder in case we want to do any server-side cleanup in the future
  return res
    .clearCookie('refreshToken', cookieOptions) // Clear the refresh token cookie on logout
    .json({ message: 'Logout successful.' });
};

// this should issue a new access token if the refresh token is valid, and send it back to the client
// we have middleware set to validate the refresh token and attach the decoded payload to req.user.refresh,
//  so if we have that info available then we know the refresh token is valid and we can issue a new access token
const refreshToken = async function (req, res, next) {
  // if the refresh token was validated in our middleware, then we
  // should have the user's info available in req.user.refresh
  if (!req.user || !req.user.refresh) {
    return res
      .status(403)
      .json({ message: 'Unauthorized. Invalid refresh token.' });
  }

  // we can use the id from the decoded refresh token payload to identify the user and issue a new access token
  const id = req.user.refresh.id;

  try {
    // check if user exists in the db
    const user = await User.getUserById(id);

    // if user exists, generate a new access token and send back to the client
    const accessToken = generateAccessToken({ id: user._id, username: user.username });
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error('In refreshToken controller error:'.red, error.message);
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken
};
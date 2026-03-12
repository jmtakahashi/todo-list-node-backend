const User = require("../models/User");
const cookieOptions = require("../config/cookieOptions");
const { generateAccessToken, generateRefreshToken } = require("../services/tokens");

/* register a new user */
const registerUser = async function (req, res, next) {
  if (!req.body || !req.body.username || !req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  const { username, email, password } = req.body;

  try {
    const response = await User.register(username, email, password);

    if (!response) {
      return res
        .status(500)
        .json({ message: 'An error occured, please try again.' });
    }

    // user already exists with the same email, return an error
    if (response.userExists) {
       return res.status(409).json({ message: 'Email already exists' });
    }

    // errors in data
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }

    // successful response: { id: id, message: 'User registered successfully' }
    const accessToken = generateAccessToken({
      id: response.id,
      username,
    });

    const refreshToken = generateRefreshToken({ id: response.id });
    
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

/* login an existing user */
const loginUser = async function (req, res, next) {
  if ( !req.body || !req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({ message: 'Email and password are required.' });
  }
  
  const { email, password } = req.body;

  try {
    const response = await User.login(email, password);

    if (!response) {
      return res
        .status(500)
        .json({ message: 'An error occured, please try again.' });
    }

    // errors in data
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }
    
    // response will be { user: {user} OR null, message }
    if (!response.user) {
      return res.status(401).json({ message: response.message });
    }

    const accessToken = generateAccessToken({
      id: response.user._id,
      username: response.user.username,
    });

    const refreshToken = generateRefreshToken({ id: response.user._id });

    return (
      res
        .status(200)
        .cookie('refreshToken', refreshToken, cookieOptions) // set the refresh token as an HTTP-only cookie
        // send the access token in the response body
        .json({
          accessToken: accessToken,
          message: response.message,
        })
    );
  } catch (error) {
    console.error('In authController loginUser error:', error.message);
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};

/* logout an existing user */
const logoutUser = async function (req, res, next) {
  await User.logout(); // This is just a placeholder in case we want to do any server-side cleanup in the future
  return res
    .status(200)
    .clearCookie('refreshToken', cookieOptions) // Clear the refresh token cookie on logout
    .json({ message: 'Logout successful.' });
};

/* refresh an existing user's access token */
// if refreshToken is valid, issue a new accessToken.
// middleware already validates the refreshToken 
// and attaches the decoded payload to req.user
const refreshToken = async function (req, res, next) {
  // use the userId from the refresh token to identify the user and issue a new access token
  const userId = req.user.id;

  try {
    // check if user exists in the db
    const user = await User.getUserById(userId);

    // if user does not exist, return an error (this should be a rare case since the refresh token is valid, but we check just in case)
    if (!user) {
      return res.status(403).json({ message: 'Forbidden.  User not found.' });
    }

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
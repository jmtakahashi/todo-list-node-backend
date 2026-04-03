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
        .json({ error: 'An error occured, please try again.' });
    }

    // user already exists with the same email, return an error
    if (response.userExists) {
       return res.status(409).json({ message: 'Email already exists.' });
    }

    // errors in data - model returns an error: error message
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }

    // successful response: { _id: id, message: 'User registered successfully' }
    const accessToken = generateAccessToken({
      id: response._id,
      username,
      isAdmin: false, // new users are not admins by default
    });

    const refreshToken = generateRefreshToken({ id: response._id });
    
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
        .json({ error: 'An error occured, please try again.' });
    }

    // errors in data - model returns an error: error message
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }
    
    // response will be { user: {user} OR null, message }
    // error could be invalid email (user not found) or invalid password (user found but password does not match)
    // either way we do not let the front end know which one is incorrect for security reasons, we just return a generic "Invalid credentials" message
    if (!response.user) {
      // log below to see the actual error message from the model
      // console.log('in authController.loginUser. login error: ', response.message)
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const accessToken = generateAccessToken({
      id: response.user._id,
      username: response.user.username,
      isAdmin: response.user.isAdmin || false, // if isAdmin field is not present, default to false
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
// and attaches the decoded payload { id } to req.user
const refreshAccessToken = async function (req, res, next) {
  const userId = req.user.id;

  try {
    // check if user exists in the db
    const response = await User.getUserById(userId); // user: { user: userInfo}

    if (!response) {
      return res
        .status(500)
        .json({ error: 'An error occured, please try again.' });
    }

    // errors in data - model returns an error: error message
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }

    // if user does not exist, return an error (this should be a rare case since the refresh token is valid, but we check just in case)
    if (!response.user) {
      return res.status(401).json({ message: response.message });
    }

    // if user exists, generate a new access token and send back to the client
    const accessToken = generateAccessToken({ id: response.user._id, username: response.user.username });

    return res.status(200).json({ accessToken });
  } catch (error) {
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};


// this endpoint is used during the register process
const checkExistingUser = async function (req, res, next) {
  if ( !req.body || !req.body.email) {
    return res
      .status(400)
      .json({ message: 'Email required.' });
  }

  const { email } = req.body;

  try {
    const response = await User.getUserByEmail(email);

    if (!response) {
      return res
        .status(500)
        .json({ error: 'An error occured, please try again.' });
    }

    // errors in data - model returns an error: error message
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }

    if (!response.user) {
      res.json(false); // email does not exist
    } else {
      res.json(true); // email exists
    }

    res.status(200)

    return res; 
  } catch (error) {
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};


module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  checkExistingUser
};
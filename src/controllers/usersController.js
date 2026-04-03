const User = require('../models/User');
const { UnauthorizedError, ForbiddenError } = require('../utils/expressError');


/* fetch all users.  admin only function.  auth middleware checks for admin privileges. */
const getAllUsers = async (req, res, next) => {
  try {
    const response = await User.getAllUsers();

    if (!response) {
      return res
        .status(500)
        .json({ error: 'An error occured, please try again.' });
    }

    if (response.users.length === 0) {
      return res.status(404).json({ message: 'No users found.' });
    }
    
    res.status(200).json({ users: response.users });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};


/* get user's profile.  auth middleware checks for correct user. */
const getSingleUser = async function (req, res, next) {
  const userId = req.params.userId;

  try {
    const response = await User.getUserById(userId);

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
      return res.status(404).json({ message: 'User not found.' });
    }

    const { user } = response;

    return res.status(200).json({ user });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};


/* create a user.  admin ONLY function.  register endpoint is in the auth route. */
const createUser = (req, res, next) => {
  if (!req.body || !(req.body.username || req.body.password)) {
    return res.status(400).json({ message: 'All fields required.' });
  }

  const { username, email, password } = req.body;

  try {
    const response = User.register({ username, email, password });

    if (!response) {
      return res
        .status(500)
        .json({ error: 'An error occured, please try again.' });
    }
    
    // errors in data - model returns an error: error message
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }

    // user already exists
    if (response.userExists) {
      return res.status(409).json({ message: 'A user with that email already exists.' });
    }

    return res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }

  res.status(201).json({ message: 'Create a new user NOT implemented yet.' });
};


/* update an existing user.  auth middleware checks for correct user. */
const updateUser = async function (req, res, next) {
  if (!req.body || !(req.body.username || req.body.password)) {
    return res.status(400).json({ message: 'Updated fields required' });
  }

  const userId = req.params.userId;
  const updatedFields = req.body; // ex. { username: "newUsername", password: "newPassword" }

  try {
    const response = await User.updateUser(userId, updatedFields);

    if (!response) {
      return res
        .status(500)
        .json({ error: 'An error occured, please try again.' });
    }

    // errors in data
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }

    if (response.matchedCount === 0) {
      return res.status(404).json({ message: response.message });
    }

    if (response.modifiedCount === 0) {
      return res.status(400).json({ message: response.message });
    }

    // successful response will be { modifiedCount: 1, message: 'User updated successfully' }
    return res.status(200).json({ message: response.message });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};


/* delete an existing user by id.  auth middleware checks for correct user. */
const deleteUser = async function (req, res, next) {
  const userId = req.params.userId;

  try {
    const response = await User.deleteUser(userId);

    if (!response) {
      return res
        .status(500)
        .json({ error: 'An error occured, please try again.' });
    }

    // errors in data
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }

    if (response.deletedCount === 0) {
      return res.status(404).json({ message: response.message });
    }

    return res.status(200).json({ message: response.message });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};


module.exports = {
  getAllUsers,
  getSingleUser,
  createUser,
  updateUser,
  deleteUser,
};

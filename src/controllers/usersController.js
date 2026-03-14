const User = require('../models/User');
const jwt = require('jsonwebtoken');


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
      return res.status(200).json(false); // email does not exist
    }

    return res.status(200).json(true); // email exists
  } catch (error) {
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};

const getUserById = async function (req, res, next) {
  const id = req.params.id;

  try {
    const response = await User.getUserById(id);

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
      return res.status(404).json({ message: 'User not found' });
    }

    const { user } = response;

    return res.status(200).json({ user });
  } catch (error) {
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};

/* update an existing user */
const updateUser = async function (req, res, next) {
  if (!req.body || !(req.body.username || req.body.password)) {
    return res.status(400).json({ message: 'Updated fields required' });
  }

  const id = req.params.id;
  const updatedFields = req.body; // ex. { username: "newUsername", password: "newPassword" }

  try {
    const response = await User.updateUser(id, updatedFields);

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

    // successful response will be { modifiedCount: response.modifiedCount, updatedUser: {}, message: 'User updated successfully' }
    const { message } = response;
    return res.status(200).json({ message });
  } catch (error) {
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};

/* delete an existing user by id */
const deleteUser = async function (req, res, next) {
  const userId = req.params.id;

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
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};

module.exports = {
  checkExistingUser,
  getUserById,
  updateUser,
  deleteUser,
};

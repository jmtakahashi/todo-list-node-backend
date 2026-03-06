const User = require('../models/User');
const jwt = require('jsonwebtoken');

const checkExistingUser = async function (req, res, next) {
  const { email } = req.body;

  try {
    const response = await User.getUserByEmail(email);

    if(response) {
      return res.status(200).json(true); // email exists
    } else {
      return res.status(200).json(false); // email does not exist
    }
  } catch (error) {
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};

const getUserById = async function (req, res, next) {
  const id = req.params.id;

  try {
    const response = await User.getUserById(id);

    if (!response) {
      return res.status(404).json({ error: 'User not found' });
    };
    
    return res.status(200).json(response);
  } catch (error) {
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};

const updateUser = async function (req, res, next) {
  const id = req.params.id;
  const updatedFields = req.body; // { username: "newUsername", password: "newPassword" }

  delete updatedFields._id; // Ensure _id is not included in the update
  delete updatedFields.createdAt; // Ensure createdAt is not included in the update

  try {
    const response = await User.updateUser(id, updatedFields);

    if (response.matchedCount === 0) {
      return res.status(404).json({ message: response.message });
    }

    if (response.modifiedCount === 0) {
      return res.status(400).json({ message: response.message });
    }
    return res.status(200).json({ message: response.message });
  } catch (error) {
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};

const deleteUser = async function (req, res, next) {
  const id = req.params.id;

  try {
    const response = await User.deleteUser(id);

    if (response.deletedCount === 0) {
      return res.status(404).json({ message: response.message });
    } else {
      return res.status(200).json({message: response.message});
    }
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

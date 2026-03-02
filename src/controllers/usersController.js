const User = require('../models/User');
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

const getUserById = async function (req, res, next) {
  const id = req.params.id;

  try {
    const response = await User.getUserById(id)
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
  getUserById,
  updateUser,
  deleteUser,
};

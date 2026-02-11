const User = require('../models/User');
const jwt = require('jsonwebtoken');

const getUserById = async function (req, res) {
  const id = req.params.id;
  const response = await User.getUserById(id)
};

const updateUser = async function (req, res) {
  const id = req.params.id;
  const updatedFields = req.body; // { title: "Updated title", completed: true }

  delete updatedFields._id; // Ensure _id is not included in the update
  delete updatedFields.dateAdded; // Ensure dateAdded is not included in the update
  const response = await User.updateUser(id, updatedFields);
};

const deleteUser = async function (req, res) {
  const id = req.params.id;
  const response = await User.deleteUser(id)
};

module.exports = {
  getUserById,
  updateUser,
  deleteUser,
};

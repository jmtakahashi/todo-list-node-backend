const express = require("express");
const usersController = require("../controllers/usersController");
const { requireLoggedIn, requireCorrectUser, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireLoggedIn);

router.get('/', requireAdmin, usersController.getAllUsers); // gets all users
router.get('/:userId', requireCorrectUser, usersController.getSingleUser); // gets user by id
router.post('/', requireAdmin, usersController.createUser); // this is not the registration route, this is for creating users by an admin
router.patch('/:userId', requireCorrectUser, usersController.updateUser);
router.delete('/:userId', requireCorrectUser, usersController.deleteUser);

module.exports = router;
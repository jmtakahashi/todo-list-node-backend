const express = require("express");
const controller = require("../controllers/usersController");
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

router.post('/checkExistingUser', controller.checkExistingUser);
router.get('/:id',authenticateJWT, controller.getUserById);
router.patch('/:id',authenticateJWT, controller.updateUser);
router.delete('/:id',authenticateJWT, controller.deleteUser);

module.exports = router;
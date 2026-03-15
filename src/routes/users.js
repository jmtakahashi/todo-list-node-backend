const express = require("express");
const controller = require("../controllers/usersController");
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateJWT); // check for valid JWT and attach user to req if valid

router.post('/checkExistingUser', controller.checkExistingUser);
router.get('/:id', controller.getUserById);
router.patch('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

module.exports = router;
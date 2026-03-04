const express = require("express");
const controller = require("../controllers/usersController");

const router = express.Router();

router.post('/checkExistingUser', controller.checkExistingUser);
router.get('/:id', controller.getUserById);
router.patch('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

module.exports = router;
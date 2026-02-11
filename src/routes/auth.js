const express = require("express");
const controller = require("../controllers/authController");

const router = express.Router();

router.post("/register", controller.registerUser);
router.post("/login", controller.loginUser);
router.post("/logout", controller.logoutUser);

module.exports = router;
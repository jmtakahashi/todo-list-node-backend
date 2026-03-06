const express = require("express");
const controller = require("../controllers/authController");
const { authenticateRefreshToken } = require("../middleware/auth");
const limiter = require("../middleware/loginLimiter");

const router = express.Router();

router.post("/register", controller.registerUser);
router.post("/login", limiter, controller.loginUser);
router.post("/refresh", authenticateRefreshToken, controller.refreshToken);
router.post("/logout", controller.logoutUser);

module.exports = router;
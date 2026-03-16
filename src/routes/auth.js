const express = require("express");
const controller = require("../controllers/authController");
const { authenticateRefreshToken } = require("../middleware/auth");
const debug = require("../middleware/debug");
const limiter = require("../middleware/loginLimiter");

const router = express.Router();

router.post("/register", controller.registerUser);
router.post("/login", limiter, controller.loginUser);
router.post("/logout", controller.logoutUser);
router.get('/refresh', debug, authenticateRefreshToken, controller.refreshToken);

module.exports = router;
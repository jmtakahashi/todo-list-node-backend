const express = require("express");
const authController = require("../controllers/authController");
const { authenticateRefreshToken } = require("../middleware/auth");
const limiter = require("../middleware/loginLimiter");
const debug = require("../middleware/debug");

const router = express.Router();

router.post("/register", authController.registerUser);
router.post("/login", limiter, authController.loginUser);
router.post("/logout", authController.logoutUser);
router.get('/refresh', debug, authenticateRefreshToken, authController.refreshAccessToken);
router.post('/checkExistingUser', authController.checkExistingUser); // checks user existence by email

module.exports = router;
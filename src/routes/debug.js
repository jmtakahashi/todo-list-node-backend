const express = require('express');
const cookieOptions = require('../config/cookieOptions');

const router = express.Router();

router.get("/get-cookie", (req, res) => {
  return res
    .cookie('testCookie', 'testValue', cookieOptions)
    .json({
      message: 'cookie set',
    });
});

router.get("/check-cookie", (req, res) => {
  const { testCookie } = req.cookies;
  return res.json({ cookie: testCookie });
});

module.exports = router;
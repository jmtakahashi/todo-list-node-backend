const express = require('express');
const cookieOptions = require('../config/cookieOptions');

const router = express.Router();

router.get("/get-cookie-same-site-none", (req, res) => {
  return res
    .cookie('testCookie', 'testValue', cookieOptions)
    .json({
      message: 'cookie set',
    });
});

router.get("/get-cookie-same-site-strict", (req, res) => {
  return res
    .cookie('testCookie', 'testValue', {...cookieOptions, sameSite: 'Strict'})
    .json({
      message: 'cookie set',
    });
});

router.get("/check-cookie", (req, res) => {
  const { testCookie } = req.cookies;
  return res.json({ cookie: testCookie });
});

module.exports = router;
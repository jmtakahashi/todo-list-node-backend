const express = require("express");
const connectDB = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config/config");

const router = new express.Router();

router.post("/register", async function (req, res) {
  const { username, password } = req.body;

  try {
    const db = await connectDB();
    const user = await db.collection('users').insertOne({ username });
  } catch (error) {
    console.error('❌ Mongo error:', err);
    return res.status(500).json({ error: 'Database operation failed' });
  }
});

router.post("/login", async function (req, res) {
  const { username, password } = req.body;

  try {
    const db = await connectDB();
    const user = await db.collection("users").findOne({ username });

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        const token = jwt.sign({ username: user.username }, SECRET_KEY);
        return res.json({ token });
      }
    }
    return res.status(401).json({ error: "Invalid username/password" });
  } catch (err) {
    console.error('❌ Mongo error:', err);
    return res.status(500).json({ error: 'Database operation failed' });
  }
});

router.post("/logout", async function (req, res) { });

module.exports = router;
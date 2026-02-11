const connectDB = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config/config");

const registerUser = async function (req, res) {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)

  try {
    const db = await connectDB();
    const existingUser = await db.collection('users').findOne({ username });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const user = await db.collection('users').insertOne({ username, email, password: hashedPassword });

    if (!user) {
      return res
        .status(400)
        .json({ message: 'An error occured, please try again' });
    }

    const token = jwt.sign({ username: user.username }, SECRET_KEY);
    return res.status(201).json({
      message: 'User registered successfully',
      userId: user.insertedId,
      token,
    });
  } catch (error) {
    console.error('❌ Mongo error:', err);
    return res.status(500).json({ error: 'Database operation failed' });
  }
};

const loginUser = async function (req, res) {
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
};

const logoutUser = async function (req, res) {
  // Since JWTs are stateless, we can't invalidate them server-side.
  // The client should simply delete the token on logout.
  return res.json({ message: "Logout successful. Please delete the token on the client side." });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
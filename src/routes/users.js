const express = require("express");
const connectDB = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { SECRET_KEY } = require("../config/config");

const router = new express.Router();

module.exports = router;
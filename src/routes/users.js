const express = require("express");
const connectDB = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { SECRET_KEY } = require("../config");

const router = new express.Router();

module.exports = router;
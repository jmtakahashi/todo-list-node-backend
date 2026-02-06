"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config();
require("colors");

// below are used for debugging
const { existsSync } = require("fs");
const path = require("path");

// SECRET_KEY used for auth with JWT
const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

// "+" uniary operator will try to convert the value to a number if it isn't already
const PORT = +process.env.PORT || 3001;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return process.env.NODE_ENV === "test"
    ? "mongodb://localhost:27017/todo_list_test"
    : process.env.DATABASE_URL || "mongodb://localhost:27017/todo_list";
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("\nTodo List Config:".brightCyan);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR:".yellow, BCRYPT_WORK_FACTOR);
console.log("MonogoDB URI:".yellow, getDatabaseUri());
console.log("NODE_ENV:".yellow, process.env.NODE_ENV);
console.log("process.env".yellow, process.env);

module.exports = {
  SECRET_KEY,
  PORT,
  getDatabaseUri,
  BCRYPT_WORK_FACTOR
};

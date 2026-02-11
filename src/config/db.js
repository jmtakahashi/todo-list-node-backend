/** Mongodb setup for todo app. */
/** - this file is required in our models files or routes */

const { MongoClient } = require("mongodb");
const { getDatabaseUri } = require("./config");

const client = new MongoClient(getDatabaseUri());

/** Connect to MongoDB (only once) and return the db instance */
// the connectDB function solution gotten from chatGPT.  mongo docs show different
let db;

async function connectDB() {
  if (!db) {
    try {
      await client.connect();
      // below arg is the database name (not the collection name)
      db = client.db("todo_list");
      console.log("✅ Connected to MongoDB");
    } catch (err) {
      console.error("❌ MongoDB connection error:", err);
      throw err;
    }
  }
  return db;
}

module.exports = connectDB;
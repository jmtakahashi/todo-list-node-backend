/* Mongodb db setup - required in our models files or routes */

const { MongoClient } = require("mongodb");
const { getDatabaseUri, getDatabaseName } = require("./config");
const { get } = require("../app");

const client = new MongoClient(getDatabaseUri());

// Connect to MongoDB (only once) and return the db instance
// the connectDB fn() solution gotten from chatGPT.  mongo docs show different
let dbConnection;

async function connectDB() {
  if (!dbConnection) {
    try {
      await client.connect();
      // below arg is the database name (not the collection name)
      db = client.db(getDatabaseName());
      console.log("✅ Connected to MongoDB");
    } catch (err) {
      console.error("❌ MongoDB connection error:", err);
      throw err;
    }
  }
  return dbConnection;
}

async function disconnectDB() {
  if (client) {
    try {
      await client.close();
      console.log("✅ Disconnected from MongoDB");
    } catch (err) {
      console.error("❌ MongoDB disconnection error:", err);
      throw err;
    }
  }
}

module.exports = { connectDB, disconnectDB };

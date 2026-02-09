"use strict";

/** separate our server startup logic for testing purposes */

const app = require("./app");
const { PORT } = require("./config/config");

require("colors");

app.listen(PORT, function () {
  const url =
    process.env.NODE_ENV === 'production'
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : 'http://localhost';
  console.log(`=> Started on ${url}:${PORT}\n`.brightCyan);
});
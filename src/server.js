"use strict";

/* separate our server startup logic for testing purposes 
(so we can import the app without starting the server)
supertest will NOT run if the server is already running */

const app = require("./app");
const { PORT } = require("./config/config");

app.listen(PORT, function () {
  const url =
    process.env.NODE_ENV === 'production'
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : 'http://localhost';
  console.log('=> [server.js] Started on '.brightCyan + `${url}:${PORT}\n`);
});
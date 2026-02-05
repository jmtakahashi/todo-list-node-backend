"use strict";

/** separate our server startup logic for testing purposes */

const app = require("./app");
const { PORT } = require("./config");

require("colors");

app.listen(PORT, function () {
  // the url terniary is specific to render.com
  const url =
    process.env.NODE_ENV === "production"
      ? null
      : "http://localhost";
  console.log(`=> Started on ${url}:${PORT}\n`.brightCyan);
});
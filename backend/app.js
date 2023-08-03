"use strict";

/** Express app for todo list. */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

/*******************************/

const app = express();

app.use(cors());
/* https://stackoverflow.com/a/71878799/7207125 */
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());

/*******************************/
/*********SERVER ROUTES*********/
/*******************************/

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/todos", todoRoutes);

module.exports = app;

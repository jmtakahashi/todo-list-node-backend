// only need to require these once and they will be accessible throughout our app)
require('dotenv').config();
require('colors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const corsOptions = require('./config/corsOptions');
const { NotFoundError } = require('./utils/expressError');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const todoRoutes = require('./routes/todos');

const app = express();

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// router routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/todos', todoRoutes);

// so we don't get the "not found" error in our console for the favicon
app.get('/favicon.ico', (req, res) => res.sendStatus(204));

// our home page of our backend. just send back a 200 response
app.get('/', (req, res) => res.sendStatus(200));

/** Handle 404 errors */
// this will catch every request that doesn't match a route above and pass a NotFoundError to the next handler.
// adding a parameter to next() tells express that we want to call an error handler
app.use(function (req, res, next) {
  console.log('hit the 404 app.use()'.brightCyan);

  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
// express knows that a function is an error handler because the function has 4 params
app.use(function (err, req, res, next) {
  console.log('hit the generic app.use()'.brightCyan);
  if (process.env.NODE_ENV !== 'test') console.error(err.stack);

  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;

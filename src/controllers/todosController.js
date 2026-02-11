const Todo = require('../models/Todo');

// Controller functions that call the corresponding model functions and handle the HTTP responses
// call next to pass control to the next middleware (e.g., error handling) if needed

// return res.status(500).json({ error: 'Database operation failed' });

/**
 * Controllers:
	•	Decide how errors map to HTTP
	•	Decide status codes
	•	Decide response shape
   knows nothing about db
 */

const getAllTodos = async (req, res, next) => {
  try {
    const data = await Todo.getAllTodos();
    return res.status(200).json(data);
  } catch (error) {
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};

const addTodo = async (req, res, next) => {
  const newTodo = {
    task: req.body.task,
    completed: req.body.completed || false, // default to false if not provided
    dateAdded: req.body.dateAdded || new Date(), // default to current date if not provided
  };

  try {
    const data = await Todo.createTodo(newTodo);
    return res.status(200).json(data); // successful response will be an object with the new todo including its id as set by Mongo
  } catch (error) {
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};

const updateTodo = async (req, res, next) => {
  const id = req.params.id;
  const updatedFields = req.body; // { title: "Updated title", completed: true }

  delete updatedFields._id; // Ensure _id is not included in the update
  delete updatedFields.dateAdded; // Ensure dateAdded is not included in the update

  try {
    const data = await Todo.updateTodo(id, updatedFields);
    return res.status(200).json(data); // data will contain a message about the update result (e.g., not found, no changes, or success)
  } catch (error) {
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }

};

const deleteTodo = async (req, res, next) => {
  const id = req.params.id;

  try {
    const data = await Todo.deleteTodo(id);
    return res.status(200).json(data); // data will contain a message about the delete result (e.g., not found or success)
  } catch (error) {
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};

module.exports = {
  getAllTodos,
  addTodo,
  updateTodo,
  deleteTodo,
};

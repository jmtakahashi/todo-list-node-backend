const Todo = require('../models/Todo');

/**
 Controllers:
	•	Decide how errors map to HTTP
	•	Decide status codes
	•	Decide response shape
   knows nothing about db
 */

// req.user = {id: _id} is available here if we need to use it for auth/permissions

const getAllTodos = async (req, res, next) => {
  console.log('running todosController.getAllTodos'.brightCyan);

  console.log('req.user in getAllTodos:'.yellow, req.user)
  
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const data = await Todo.getAllTodos(req.user.id); // pass the authenticated user's id to get only their todos
    return res.status(200).json(data);
  } catch (error) {
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};

const addTodo = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!req.body.task) {
    return res.status(400).json({ message: 'Task is required' });
  }

  const newTodo = {
    task: req.body.task,
    completed: req.body.completed || false, // default to false if not provided
    dateAdded: req.body.dateAdded || new Date(), // default to current date if not provided
    owner: req.user.id, // associate the new todo with the authenticated user's id
  };

  try {
    const data = await Todo.createTodo(newTodo);
    return res.status(200).json(data.newTodo); // successful response will be an object with the new todo including its id as set by Mongo
  } catch (error) {
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};

const updateTodo = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const id = req.params.id;
  const updatedFields = req.body; // { task: "Updated title", completed: true }

  try {
    const data = await Todo.updateTodo(id, updatedFields);
    // data will contain a message about the update result (e.g., not found, no changes, or success)
    // the controller decides what status to return based on the db's returned value
    if (data.message === 'Todo not found') {
      return res.status(404).json(data);
    }
    return res.status(200).json(data);
  } catch (error) {
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }

};

const deleteTodo = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const id = req.params.id;

  try {
    const data = await Todo.deleteTodo(id);
    // data will contain a message about the delete result (e.g., not found or success)
    // the controller decides what status to return based on the db's returned value
    if (data.message === 'Todo not found') {
      return res.status(404).json(data);
    }
    return res.status(200).json(data);
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

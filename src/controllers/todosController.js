const Todo = require('../models/Todo');

// auth middleware will have already verified the user's access token

/* fetch all todos for the authenticated user */
const getAllTodos = async (req, res, next) => {
  try {
    const response = await Todo.getAllTodos(req.user.id); // pass the authenticated user's id to get only their todos

    if (!response) {
      return res
        .status(500)
        .json({ message: 'An error occured, please try again.' });
    }

    // errors in data
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }
    
    // successful response will be { todos: response } where response is an array of todo objects (can be empty if user has no todos)
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* add a new todo for the authenticated user */
const addTodo = async (req, res, next) => {
  if (!req.body || !req.body.task) {
    return res.status(400).json({ message: 'Task is required' });
  }

  const { task } = req.body;
  const owner = req.user.id;

  try {
    const response = await Todo.createTodo(task, owner);

    if (!response) {
      return res
        .status(500)
        .json({ message: 'An error occured, please try again.' });
    }

    // errors in data
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }
    
    // successful response will be { response, newTodo: { id: response.insertedId, task, completed, dateAdded, owner }, message: 'Todo created successfully' };
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* update an existing todo for the authenticated user */
const updateTodo = async (req, res, next) => { 
  if (!req.body || !(req.body.task || req.body.completed)) {
    return res.status(400).json({ message: 'Updated fields required' });
  }

  const todoId = req.params.id;
  const updatedFields = req.body; // { task: "Updated title", completed: true }

  try {
    const response = await Todo.updateTodo(todoId, updatedFields);

    if (!response) {
      return res
        .status(500)
        .json({ message: 'An error occured, please try again.' });
    }

    // errors in data
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }
    
    if (response.matchedCount === 0) {
      return res.status(404).json({ message: response.message });
    }

    if (response.modifiedCount === 0) {
      return res.status(400).json({ message: response.message });
    }

    // successful response will be { modifiedCount: response.modifiedCount, updatedTodo: {}, message: 'Todo updated successfully' }
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }

};

/* delete an existing todo for the authenticated user */
const deleteTodo = async (req, res, next) => {
  const todoId = req.params.id;

  try {
    const response = await Todo.deleteTodo(todoId);

    if (!response) {
      return res
        .status(500)
        .json({ message: 'An error occured, please try again.' });
    }

    // errors in datas
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }
    
    // response will contain a message about the delete result (e.g., not found or success)
    if (response.deletedCount === 0) {
      return res.status(404).json({ message: response.message});
    }

    return res.status(200).json({ message: response.message });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTodos,
  addTodo,
  updateTodo,
  deleteTodo,
};

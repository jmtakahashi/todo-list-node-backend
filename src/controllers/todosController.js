const Todo = require('../models/Todo');


/* fetch all todos for the authenticated user.  auth middleware checks for correct user. */
const getAllTodosByUser = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const response = await Todo.getAllTodosByUser(userId); // pass the authenticated user's id to get only their todos

    if (!response) {
      return res
        .status(500)
        .json({ error: 'An error occured, please try again.' });
    }

    // errors in data - model returns an error: error message
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }
    
    // successful response will be { todos: response } where response is an array of todo objects (can be empty if user has no todos)
    const { todos } = response;

    return res.status(200).json({ todos });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};


/* fetch all todos for the authenticated user's given list.  auth middleware checks for correct user. */
const getAllTodosByList = async (req, res, next) => {
  const listId = req.params.listId;
  const userId = req.params.userId;

  // auth middleware verifies the user, but we still need to
  // check that the requested list belongs to the authenticated user.

  try {
    const response = await Todo.getAllTodosByList(listId, userId); // pass the authenticated user's id to get only their todos for the list

    if (!response) {
      return res
        .status(500)
        .json({ error: 'An error occured, please try again.' });
    }

    // errors in data - model returns an error: error message
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }
    
    // successful response will be { response: [todos] } where response is an array of todo objects (can be empty if user has no todos)
    const { todos } = response;

    // if (todos.length === 0) {
    //   return res.status(404).json({ message: 'No todos found for this list.' });
    // }

    return res.status(200).json({ todos });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};


/* fetch a single todo by its id.  auth middleware checks for correct user. */
const getSingleTodo = async (req, res, next) => {
  const userId = req.params.userId;
  const todoId = req.params.todoId;

  // auth middleware verifies the user, but we still need to
  // check that the requested todo belongs to the authenticated user.

  try {
    const response = await Todo.getTodoById(todoId, userId);

    if (!response) {
      return res
        .status(500)
        .json({ error: 'An error occured, please try again.' });
    }

    // errors in data - model returns an error: error message
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }

    // successful response will be { response: todo } where response is a single todo object
    const { todo } = response;

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found.' });
    }

    return res.status(200).json({ todo });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};


/* add a new todo for the authenticated user and list.  auth middleware checks for logged-in user. */
const createTodo = async (req, res, next) => {
  if (!req.body || !req.body.task) {
    return res.status(400).json({ message: 'Task is required.' });
  }

  const { task } = req.body;
  const listId = req.params.listId;
  const ownerId = req.params.userId;

  // check that the listId in the params belongs to the userId in the params is done in the model

  try {
    const response = await Todo.createTodo(task, listId, ownerId);

    if (!response) {
      return res
        .status(500)
        .json({ error: 'An error occured, please try again.' });
    }

    // errors in data - model returns an error: error message
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }
    
    // successful response will be { response, newTodo: { _id: response.insertedId, task, completed, dateAdded, owner }, message: 'Todo created successfully' };
    const { newTodo, message } = response;
    
    return res.status(201).json({ newTodo, message});
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};


/* update an existing todo for the authenticated user */
const updateTodo = async (req, res, next) => {
  if (!req.body || !(req.body.task || req.body.completed || req.body.listId)) {
    return res.status(400).json({ message: 'Updated fields required.' });
  }

  const userId = req.params.userId;
  const listId = req.params.listId; // we need the listId to check that the todo belongs to the user and also to check that the new listId (if provided) belongs to the user
  const todoId = req.params.todoId;
  const updatedFields = req.body; // { task: "Updated title", completed: true }

  // check that todo is owned by the userId in the params is done in the model
  // if a listId is provided in the updatedFields, the model will check that the list belongs to the user as well

  try {
    const response = await Todo.updateTodo(todoId, userId, listId, updatedFields);

    if (!response) {
      return res
        .status(500)
        .json({ error: 'An error occured, please try again.' });
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
    const { message } = response;
    return res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};


/* delete an existing todo for the authenticated user */
const deleteTodo = async (req, res, next) => {
  const userId = req.params.userId;
  const listId = req.params.listId;
  const todoId = req.params.todoId;

  // check that todo is owned by the userId in the params is done in the model

  try {
    const response = await Todo.deleteTodo(todoId, userId, listId);

    if (!response) {
      return res
        .status(500)
        .json({ error: 'An error occured, please try again.' });
    }

    // errors in data - model returns an error: error message
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }

    // response will contain a message about the delete result (e.g., not found or success)
    if (response.deletedCount === 0) {
      return res.status(404).json({ message: response.message });
    }

    return res.status(200).json({ message: response.message });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};;

module.exports = {
  getAllTodosByUser,
  getAllTodosByList,
  getSingleTodo,
  createTodo,
  updateTodo,
  deleteTodo,
};

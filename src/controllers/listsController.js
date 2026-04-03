const List = require('../models/List');
const Todo = require('../models/Todo');
const { UnauthorizedError, ForbiddenError } = require('../utils/expressError');


/* fetch all lists for the authenticated user.  auth middleware checks for correct user. */
const getAllLists = async (req, res, next) => {
  const userId = req.params.userId

  try {
    const response = await List.getAllLists(userId);

    if (!response) {
      return res
        .status(500)
        .json({ error: 'An error occured, please try again.' });
    }

    if (response.lists.length === 0) {
      return res.status(404).json({ message: 'No lists found.' });
    }
    
    res.status(200).json({ lists: response.lists });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
}

/* fetch single list for the authenticated user.  auth middleware checks for correct user. */
const getSingleList = async (req, res, next) => {
  const userId = req.params.userId;
  const listId = req.params.listId

  try {
    const response = await List.getSingleList(listId, userId)

    if (!response) {
      return res
        .status(500)
        .json({ error: 'An error occured, please try again.' });
    }

    if (!response.list) {
      return res.status(404).json({ message: 'List not found.' });
    }

    const { list } = response;

    return res.status(200).json({ list });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};


/* create a list for the authenticated user.  auth middleware checks for logged-in user. */
const createList = async (req, res, next) => {
  if (!req.body || !req.body.title) {
    return res.status(400).json({ message: 'List name is required.' });
  }

  const userId = req.params.userId;
  const { title } = req.body

  try {
    const response = await List.createList(title, userId);

    if (!response) {
      return res
        .status(500)
        .json({ error: 'An error occured, please try again.' });
    }

    // errors in data - model returns an error: error message
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }

    // successful response will be { response, newList: { _id: response.insertedId, title, dateAdded, ownerId }, message: 'Todo created successfully' };
    const { newList, message } = response;

    return res.status(201).json({ newList, message });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};


/* update a list for the authenticated user.  auth middleware checks for correct user. */
const updateList = async (req, res, next) => {
  if (!req.body || !req.body.title) {
    return res.status(400).json({ message: 'Updated fields required.' });
  }

  const userId = req.params.userId;
  const listId = req.params.listId;
  const updatedFields = req.body; // { title: "Updated title" }

  try {
    const response = await List.updateList(listId, userId, updatedFields);

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
    next(error); // Pass the error to the error handler middleware
  }
};


/* delete a list for the authenticated user.  auth middleware checks for correct user. */
const deleteList = async (req, res, next) => {
  const userId = req.params.userId;
  const listId = req.params.listId;

  try {
    const response = await List.deleteList(listId, userId);

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
};

module.exports = {
  getAllLists,
  getSingleList,
  createList,
  updateList,
  deleteList
};
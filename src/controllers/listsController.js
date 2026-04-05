const List = require('../models/List');


/* fetch all lists for the authenticated user.  auth middleware checks for correct user. */
const getAllListsByUser = async (req, res, next) => {
  const userId = req.params.userId

  try {
    const response = await List.getAllListsByUser(userId);

    if (!response) {
      return res
        .status(500)
        .json({ error: 'An error occured, please try again.' });
    }

    // errors in data - model returns an error: error message
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }

    // successful response will be { response: [lists] } where response is an array of list objects (can be empty if user has no lists)
    const { lists } = response;

    // if (lists.length === 0) {
    //   return res.status(404).json({ message: 'No lists found.' });
    // }

    return res.status(200).json({ lists });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
}

/* fetch single list for the authenticated user.  auth middleware checks for correct user. */
const getSingleList = async (req, res, next) => {
  const userId = req.params.userId;
  const listId = req.params.listId

  try {
    const response = await List.getSingleList(listId, userId);

    if (!response) {
      return res
        .status(500)
        .json({ error: 'An error occured, please try again.' });
    }

    // errors in data - model returns an error: error message
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }

    // successful response will be { response: list } where response is a single list object
    const { list } = response;
    
    if (!response.list) {
      return res.status(404).json({ message: 'List not found.' });
    }

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

    // successful response will be { response, newList: { _id: response.insertedId, title, dateAdded, ownerId }, message: 'List created successfully' };
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

    // successful response will be { modifiedCount: response.modifiedCount, updatedList: {}, message: 'List updated successfully' }
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
  getAllListsByUser,
  getSingleList,
  createList,
  updateList,
  deleteList
};
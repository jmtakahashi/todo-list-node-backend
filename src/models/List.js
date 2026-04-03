const { connectDB } = require('../config/db');
const { ObjectId } = require('mongodb');

function List(title, createdAt, updatedAt, ownerId) {
  this.title = title;
  this.createdAt = createdAt;
  this.updatedAt = updatedAt;
  this.ownerId = ownerId;
}

/* retrieve all lists for a specific user from the db */
List.getAllLists = async function (ownerId) {
  if (typeof ownerId !== 'string') {
    ownerId = '';
  }
  ownerId = ownerId.trim();
  
  try {
    const db = await connectDB();
    const listsCollection = db.collection('lists');

    const lists = await listsCollection.find({ ownerId }).toArray();

    return { lists };
  } catch (error) {
    console.error('Error in List.getAllLists:', error.message);
    throw error; // Rethrow the error to be handled by the caller
  }
};


/* retrieve a single lists for a specific user from the db */
List.getSingleList = async function (listId) {
  if (typeof listId !== 'string') {
    listId = '';
  }
  listId = listId.trim();
  
  try {
    const db = await connectDB();
    const listsCollection = db.collection('lists');
    const list = await listsCollection.findOne({ _id: new ObjectId(listId) });

    // list will be a list object if found, or null if not found

    return { list };
  } catch (error) {
    console.error('Error in List.getSingleList:', error.message);
    throw error; // Rethrow the error to be handled by the controller's try-catch
  }
};


/* create a list for the authorized user */
List.createList = async function (title, ownerId) {
  // validate and sanitize inputs (title, ownerId)
  if (typeof ownerId !== 'string') {
    ownerId = '';
  }
  if (typeof title !== 'string') {
    return { error: 'Invalid list name value' };
  }

  ownerId = ownerId.trim();
  title = title.trim();

  try {
    const db = await connectDB();
    const listsCollection = db.collection('lists');

    const newList = {
      title: title,
      createdAt: new Date(),
      updatedAt: null,
      ownerId: ownerId,
    };

    const response = await listsCollection.insertOne(newList);

    /*
      - response:
      {
        "acknowledged": true,
        "insertedId": new ObjectId('698bfd18f583137e71a9aece')
      }
    */

    if (!response.acknowledged) {
      throw new Error('Failed to create todo');
    }

    return {
      response,
      newList: { ...newList, _id: response.insertedId },
      message: 'List created successfully',
    };
  } catch (error) {
    console.error('Error in List.createList:', error.message);
    throw error; // Rethrow the error to be handled by the controller's try-catch
  }
};


/* update a list for the authorized user */
List.updateList = async function (listId, updatedFields) {
  // sanitize input by only allowing certain fields to be updated
  const allowedFields = ['title'];
  Object.keys(updatedFields).forEach((key) => {
    if (!allowedFields.includes(key)) {
      delete updatedFields[key];
    }
  });

  // if no fields left after cleaning, return error
  if (Object.keys(updatedFields).length === 0) {
    return { error: 'No updated data provided.' };
  }

  // validate and sanitize inputs (listId, title)
  if (typeof listId !== 'string') {
    listId = '';
  }
  if (typeof updatedFields.title !== 'string') {
    return { error: 'Invalid list name value' };
  }

  listId = listId.trim();
  updatedFields.title = updatedFields.title.trim();

  try {
    const db = await connectDB();
    const listsCollection = db.collection('lists');
    const response = await listsCollection.updateOne(
      { _id: new ObjectId(listId) },
      { $set: { ...updatedFields, updatedAt: new Date() } },
    );

    if (response.matchedCount === 0) {
      return { message: 'List not found' };
    }

    if (response.modifiedCount === 0) {
      return { message: 'No changes made to the list' };
    }

    return { message: 'List updated successfully' };
  } catch (error) {
    console.error('Error in List.updateList:', error.message);
    throw error; // Rethrow the error to be handled by the controller's try-catch
  }
};


/* delete a list for the authorized user */
List.deleteList = async function (listId) {
  if (typeof listId !== 'string') { listId = ''; }
  listId = listId.trim()

  try {
    const db = await connectDB();
    const listsCollection = db.collection('lists');

    // check if list has any todos associated with it
    const todosCollection = db.collection('todos');
    const associatedTodos = await todosCollection.find({ listId }).toArray();

    if (associatedTodos.length > 0) {
      return { error: 'Cannot delete list containing todos. Please delete the todos or move the todos to another list first.' };
    }

    const response = await listsCollection.deleteOne({
      _id: new ObjectId(listId),
    });

    /*
      - throws an error if invalid id format is provided
      - if valid id format is provided, response will be:
      {
        "acknowledged": true,
        "deletedCount": 1 or 0
      }
    */
    
    if (!response.acknowledged) {
      throw new Error('Failed to delete list');
    }

    if (response.deletedCount === 0) {
      return { deletedCount: response.deletedCount, message: 'List not found' };
    }

    return {
      deletedCount: response.deletedCount,
      message: 'List deleted successfully',
    };
  } catch (error) {
    console.error('❌ Mongo error:', err);
    throw error; // Rethrow the error to be handled by the controller's try-catch
  }
};

module.exports = List;

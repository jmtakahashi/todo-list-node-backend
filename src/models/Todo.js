const { connectDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const validator = require('validator');

function Todo (title, completed, createdAt, updatedAt, ownerId, listId) {
    this.title = title;
    this.completed = completed;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.ownerId = ownerId;
    this.listId = listId;
}

/* GET all todos for a specific user from the db */
Todo.getAllTodosByUser = async function (ownerId) {
  if (typeof ownerId !== 'string') { ownerId = ''; }

  ownerId = ownerId.trim();

  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const todosCollection = db.collection('todos');

    const todos = await todosCollection.find({ ownerId }).toArray();

    // todos will be an array of todo objects (can be empty if user has no todos)

    return { todos };
  } catch (error) {
    console.error('❌ Mongo error:', error);
    throw error; // Re-throw the error to be caught by the controller's try-catch
  }
};


/* GET all todos for a specific user and list from the db */
Todo.getAllTodosByList = async function (listId, ownerId) {
  if (typeof listId !== 'string') { listId = ''; }
  if (typeof ownerId !== 'string') { ownerId = ''; }
  
  ownerId = ownerId.trim();
  listId = listId.trim();

  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const todosCollection = db.collection('todos');

    const todos = await todosCollection.find({ listId, ownerId }).toArray();

    // todos will be an array of todo objects (can be empty if user has no todos)

    return { todos };
  } catch (error) {
    console.error('❌ Mongo error:', error);
    throw error; // Re-throw the error to be caught by the controller's try-catch
  }
};


/* GET a single todo by its id */
Todo.getTodoById = async function (todoId, ownerId) {
  if (typeof todoId !== 'string') { todoId = ''; }
  if (typeof ownerId !== 'string') { ownerId = ''; }
  
  ownerId = ownerId.trim();
  todoId = todoId.trim();

  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const todosCollection = db.collection('todos');

    const todo = await todosCollection.findOne({ _id: new ObjectId(todoId), ownerId });

    // todo will be a todo object if found, or null if not found
    
    return { todo };
  } catch (error) {
    console.error('❌ Mongo error:', error);
    throw error; // Re-throw the error to be caught by the controller's try-catch
  }
};


/* CREATE a new todo in the database */
Todo.createTodo = async function (task, listId, ownerId) {
  // TODO: validate and sanitize inputs (task, ownerId)
  if (typeof listId !== 'string') { listId = ''; }
  if (typeof ownerId !== 'string') { ownerId = ''; }
  if (typeof task !== 'string') { return { error: 'Invalid task value.' }; }

  listId = listId.trim();
  ownerId = ownerId.trim();
  task = task.trim();

  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const todosCollection = db.collection('todos');


    // ensure listId is actually a list in the db and belongs to the user
    const listsCollection = db.collection('lists');
    const existingList = await listsCollection.findOne({ _id: new ObjectId(listId), ownerId });

    if (!existingList) {
      throw new Error('Invalid listId. List not found.');
    }

    const newTodo = {
      task,
      completed: false,
      dateAdded: new Date(),
      ownerId,
      listId,
    };

    const response = await todosCollection.insertOne(newTodo);

    /*
      - response:
      {
        "acknowledged": true,
        "insertedId": new ObjectId('698bfd18f583137e71a9aece')
      }
    */

    if (!response.acknowledged) {
      throw new Error('Failed to create todo.');
    }

    return {
      response,
      newTodo: { ...newTodo, _id: response.insertedId },
      message: 'Todo created successfully.',
    };
  } catch (error) {
    console.error('❌ Mongo error:', error);
    throw error; // Re-throw the error to be caught by the controller's try-catch
  }
};


/* UPDATE a todo in the database */
Todo.updateTodo = async function (todoId, ownerId, updatedFields) {
  // sanitize input by only allowing certain fields to be updated
  const allowedFields = ['task', 'completed', 'listId'];
  Object.keys(updatedFields).forEach((key) => {
    if (!allowedFields.includes(key)) {
      delete updatedFields[key];
    }
  });

  // if no fields left after cleaning, return error
  if (Object.keys(updatedFields).length === 0) {
    return { error: 'No valid fields provided for update.' };
  }

  // cleanup
  if (typeof todoId !== 'string') {
    return { error: 'Invalid id.' };
  }
  todoId = todoId.trim();

  const fieldsToUpdate = { };

  // if "completed" field is provided
  if (Object.keys(updatedFields).includes('completed')) {
    if (typeof updatedFields.completed !== 'boolean') {
      return { error: 'Invalid completed value.' };
    }

    fieldsToUpdate["completed"] = updatedFields.completed;
  }

  // if "task" field is provided
  if (Object.keys(updatedFields).includes('task')) {
    if (typeof updatedFields.task !== 'string') { return { error: 'Invalid task value.' }; }
    updatedFields.task = updatedFields.task.trim();

    fieldsToUpdate["task"] = updatedFields.task;
  }

  // if "listId" field is provided
  if (Object.keys(updatedFields).includes('listId')) {
    if (typeof updatedFields.listId !== 'string') {
      return { error: 'Invalid listId value.' };
    }
    updatedFields.listId = updatedFields.listId.trim();

    fieldsToUpdate['listId'] = updatedFields.listId;
  }

  const dateUpdated = new Date();

  fieldsToUpdate["dateUpdated"] = dateUpdated;

  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const todosCollection = db.collection('todos');

    // ensure listId is actually a list in the db and belongs to the user
    const listsCollection = db.collection('lists');
    const existingList = await listsCollection.findOne({
      _id: new ObjectId(fieldsToUpdate.listId),
      ownerId
    });

    if (!existingList) {
      throw new Error('Invalid listId. List not found.');
    }

    const response = await todosCollection.updateOne(
      { _id: new ObjectId(todoId), ownerId },
      { $set: fieldsToUpdate },
    );

    /*
      - throws an error if invalid id format is provided
      - if valid id format is provided, response will be like:
      {
        acknowledged: true,
        modifiedCount: 0,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: 1
      }
     */

    if (!response.acknowledged) {
      throw new Error('Failed to update todo.');
    }

    if (response.matchedCount === 0) {
      return { matchedCount: response.matchedCount, message: 'Todo not found.' };
    }

    if (response.modifiedCount === 0) {
      return {
        modifiedCount: response.modifiedCount,
        message: 'No changes made to the todo.',
      };
    }

    return {
      modifiedCount: response.modifiedCount,
      // updatedTodo: {},
      message: 'Todo updated successfully.',
    };
  } catch (error) {
    console.error('❌ Mongo error:', error);
    throw error; // Re-throw the error to be caught by the controller's try-catch
  }
};


/* DELETE a todo from the database */
Todo.deleteTodo = async function (todoId, ownerId) {
  if (typeof todoId !== 'string') {
    todoId = '';
  }
  if (typeof ownerId !== 'string') {
    ownerId = '';
  }

  todoId = todoId.trim();
  ownerId = ownerId.trim();

  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const todosCollection = db.collection('todos');
    const response = await todosCollection.deleteOne({ _id: new ObjectId(todoId), ownerId });

    /*
      - throws an error if invalid id format is provided
      - if valid id format is provided, response will be:
      {
        "acknowledged": true,
        "deletedCount": 1 or 0
      }
    */

    if (!response.acknowledged) {
      throw new Error('Failed to delete todo.');
    }

    if (response.deletedCount === 0) {
      return { deletedCount: response.deletedCount, message: 'Todo not found.' };
    }

    return {
      deletedCount: response.deletedCount,
      message: 'Todo deleted successfully.',
    };
  } catch (error) {
    console.error('❌ Mongo error:', error);
    throw error; // Re-throw the error to be caught by the controller's try-catch
  }
};


module.exports = Todo;
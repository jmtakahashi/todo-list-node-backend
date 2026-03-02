const connectDB = require('../config/db');
const { ObjectId } = require('mongodb');
function Todo (title, completed, createdAt, updatedAt) {
    this.title = title;
    this.completed = completed;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
}

Todo.getAllTodos = async function(ownerId) {
  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const todos = db.collection('items');
    const response = await todos.find({ owner: ownerId }).toArray();
    return response;
  } catch (err) {
    console.error('❌ Mongo error:', err);
    throw err; // re-throw the error to be caught by the controller's try-catch
  }
}

Todo.createTodo = async function (newTodo) {
  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const todos = db.collection('items');
    const response = await todos.insertOne(newTodo);
    /*
      response:
      {
        "acknowledged": true,
        "insertedId": new ObjectId('698bfd18f583137e71a9aece')
      }
      
      newTodo (will now have the _id field added by MongoDB):
      {
        task: 'test return ID on new todo',
        completed: false,
        dateAdded: 2026-02-11T03:52:55.963Z,
        _id: new ObjectId('698bfd18f583137e71a9aece')
      }
    */
    return {response, newTodo}; // return the new todo with the _id field included (the controller can decide what to send back to the client)
  } catch (err) {
    console.error('❌ Mongo error:', err);
    throw err; // re-throw the error to be caught by the controller's try-catch
  }
}

Todo.updateTodo = async function (id, updatedFields) {
  // sanitize input by only allowing certain fields to be updated
  const allowedFields = ['task', 'completed'];
  Object.keys(updatedFields).forEach(key => {
    if (!allowedFields.includes(key)) {
      delete updatedFields[key];
    }
  });

  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const todos = db.collection('items');
    const response = await todos.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedFields },
    );
    /**
      throws an error if invalid id format is provided
      if valid id format is provided, response will be like:
      {
        acknowledged: true,
        modifiedCount: 0,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: 1
      }
     */

    if (response.matchedCount === 0) {
      return { message: 'Todo not found' };
    }

    if (response.modifiedCount === 0) {
      return { message: 'No changes made to the todo' };
    }

    return { message: 'Todo updated successfully' };
  } catch (err) {
    console.error('❌ Mongo error:', err);
    throw err; // re-throw the error to be caught by the controller's try-catch
  } 
};

Todo.deleteTodo = async function (id) {
  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const todos = db.collection('items');
    const response = await todos.deleteOne({ _id: new ObjectId(id) });
    /*
    throws an error if invalid id format is provided
    if valid id format is provided, response will be:
    {
      "acknowledged": true,
      "deletedCount": 1
    }
      OR 
    {
      "acknowledged": true,
      "deletedCount": 0
    } 
    */
    if (response.deletedCount === 0) {
      return { message: 'Todo not found' };
    }
 
    return { message: 'Todo deleted successfully' };   
  } catch (err) {
    console.error('❌ Mongo error:', err);
    throw err; // re-throw the error to be caught by the controller's try-catch
  }
}

module.exports = Todo;
const connectDB = require('../config/db');
const { ObjectId } = require('mongodb');

/**
 * 	•	Catches Mongo’s ugly error
	•	Throws a meaningful domain error
	•	Knows nothing about HTTP
 */

  /**
   * What models SHOULD do with errors

Models may:
	•	Catch low-level errors (DB errors, driver errors)
	•	Translate them into domain errors
	•	Add context
	•	Re-throw

Models should not:
	•	Send responses
	•	Choose status codes
	•	Decide client-facing messages
   */


/**
 * What goes in the model

Models deal with data + domain rules.

Models are responsible for:
	•	Talking to the database
	•	Data validation at the data level
	•	Transforming raw DB records into usable objects
	•	Enforcing domain constraints

Models SHOULD contain:
	•	CRUD operations
	•	Query logic
	•	Data normalization
	•	DB-specific code (SQL, Mongo, Mongoose, Prisma, etc.)

Models SHOULD NOT:
	•	Use req or res
	•	Know about HTTP status codes
	•	Decide how errors are returned to the client
 */
// using a constructor function to define the Todo model
// no constructor function is needed since we are not creating instances of Todo in the controller
function Todo (title, completed, createdAt, updatedAt) {
    this.title = title;
    this.completed = completed;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
}

Todo.getAllTodos = async function() {
  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const todos = db.collection('items');
    const response = await todos.find().toArray();
    return response;
  } catch (error) {
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
    return newTodo; // return the new todo with the _id field included (the controller can decide what to send back to the client)
  } catch (err) {
    console.error('❌ Mongo error:', err);
    throw err; // re-throw the error to be caught by the controller's try-catch
  }
}

Todo.updateTodo = async function (id, updatedFields) {
  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const todos = db.collection('items');
    const response = await todos.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedFields },
    );
    // mongo will return a matched count and a modified count
    // we can use these to determine if the update was successful or if the todo was not found
    if (response.matchedCount === 0) {
      return { message: 'Todo not found' };
    } else {
      if (response.modifiedCount === 0) {
        return { message: 'No changes made to the todo' };
      }
      return { message: 'Todo updated successfully' };
    }
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
    } else {
      return { message: 'Todo deleted successfully' };
    }
  } catch (err) {
    console.error('❌ Mongo error:', err);
    throw err; // re-throw the error to be caught by the controller's try-catch
  }
}

module.exports = Todo;
const connectDB = require('../config/db');
const { ObjectId } = require('mongodb');

const getAllTodos = async function (req, res) {
  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const todos = db.collection('items');
    const allTodos = await todos.find().toArray();
    return res.status(200).json(allTodos);
  } catch (error) {
    console.error('❌ Mongo error:', err);
    return res.status(500).json({ error: 'Database operation failed' });
  }
};

const addTodo = async function (req, res) {
  const newTodo = req.body; // { title: "My new todo", completed: false }

  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const todos = db.collection('items');
    const response = await todos.insertOne(newTodo);
    return res.status(200).json(response.insertedId); // send back the id of the new todo
  } catch (err) {
    console.error('❌ Mongo error:', err);
    return res.status(500).json({ error: 'Database operation failed' });
  }
};

const getTodoById = async function (req, res) {
  const id = req.params.id;

  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const todos = db.collection('items');
    const todo = await todos.findOne({ _id: new ObjectId(id) });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    return res.status(200).json(todo);
  } catch (err) {
    console.error('❌ Mongo error:', err);
    return res.status(500).json({ error: 'Database operation failed' });
  }
};

const updateTodo = async function (req, res) {
  const id = req.params.id;
  const updatedFields = req.body; // { title: "Updated title", completed: true }

  delete updatedFields._id; // Ensure _id is not included in the update
  delete updatedFields.dateAdded; // Ensure dateAdded is not included in the update

  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const todos = db.collection('items');
    const response = await todos.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedFields },
    );
    if (response.matchedCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    } else {
      return res.status(200).json({ message: 'Todo updated successfully' });
    }
  } catch (err) {
    console.error('❌ Mongo error:', err);
    return res.status(500).json({ error: 'Database operation failed' });
  }
};

const deleteTodo = async function (req, res) {
  const id = req.params.id;

  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const todos = db.collection('items');
    const response = await todos.deleteOne({ _id: new ObjectId(id) });
    if (response.deletedCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    return res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error('❌ Mongo error:', err);
    return res.status(500).json({ error: 'Database operation failed' });
  }
};

module.exports = {
  getAllTodos,
  addTodo,
  getTodoById,
  updateTodo,
  deleteTodo,
};

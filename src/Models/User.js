// const connectDB = require('../config/db');
// const bcrypt = require('bcrypt');
// const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require('../config/config');
// const { ObjectId } = require('mongodb');
// const { registerUser } = require('../controllers/authController');

// function User (username, password, createdAt) {
//   this.username = username;
//   this.password = password;
//   this.createdAt = createdAt;
// };

// User.prototype.registerUser = async function() {
//   // Logic to register a new user in the database
// }
  
// User.prototype.login= async function() {

// }

// User.prototype.logout = async function() {
  
// }

// User.prototype.getUserById = async function(id) {
//   try {
//     const db = await connectDB(); // ✅ make sure connection is ready
//     const todos = db.collection('items');
//     const todo = await todos.findOne({ _id: new ObjectId(id) });
//     if (!todo) {
//       return res.status(404).json({ error: 'Todo not found' });
//     }
//     return res.status(200).json(todo);
//   } catch (err) {
//     console.error('❌ Mongo error:', err);
//     return res.status(500).json({ error: 'Database operation failed' });
//   }
// }

// User.prototype.updateUser = async function(id, updatedFields) {
//   try {
//     const db = await connectDB(); // ✅ make sure connection is ready
//     const todos = db.collection('items');
//     const response = await todos.updateOne(
//       { _id: new ObjectId(id) },
//       { $set: updatedFields },
//     );
//     if (response.matchedCount === 0) {
//       return res.status(404).json({ error: 'Todo not found' });
//     } else {
//       return res.status(200).json({ message: 'Todo updated successfully' });
//     }
//   } catch (err) {
//     console.error('❌ Mongo error:', err);
//     return res.status(500).json({ error: 'Database operation failed' });
//   }
// }

// User.prototype.deleteUser = async function(id) {
//   try {
//     const db = await connectDB(); // ✅ make sure connection is ready
//     const todos = db.collection('items');
//     const response = await todos.deleteOne({ _id: new ObjectId(id) });
//     if (response.deletedCount === 0) {
//       return res.status(404).json({ error: 'Todo not found' });
//     }
//     return res.status(200).json({ message: 'Todo deleted successfully' });
//   } catch (err) {
//     console.error('❌ Mongo error:', err);
//     return res.status(500).json({ error: 'Database operation failed' });
//   }
// }

// User.prototype.hashPassword = async function() {
//   const salt = await bcrypt.genSalt(BCRYPT_WORK_FACTOR);
//   this.password = await bcrypt.hash(this.password, salt);
// }

// module.exports = User;

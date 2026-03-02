const connectDB = require('../config/db');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config/config');
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
function User (username, email, password) {
  this.username = username;
  this.email = email;
  this.password = password;
};

User.validateUser = async function () {
  
}

User.register = async function(username, email, password) {
  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const users = db.collection('users');
    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return { error: 'Email already exists' };
    }

    const hashedPassword = await User.hashPassword(password);
    const createdAt = new Date();

    const response = await users.insertOne({
      username,
      email,
      password: hashedPassword,
      createdAt,
    });

    /*
      response:
      {
        "acknowledged": true,
        "insertedId": new ObjectId('698bfd18f583137e71a9aece')
      }
    */
    return { id: response.insertedId };
  } catch (err) {
    console.error('❌ Mongo error:', err);
    throw err; // re-throw the error to be caught by the controller's try-catch
  }
}
  
User.login = async function(email, password) {
  try {
    const db = await connectDB();
    const users = db.collection('users');
    const user = await users.findOne({ email });

    if (!user) {
      return { error: 'User not found' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { error: 'Invalid credentials' };
    }

    return { id: user._id };
  } catch (err) {
    console.error('❌ Mongo error:', err);
    throw err; // re-throw the error to be caught by the controller's try-catch
  }
}

User.logout = async function() {
  // Since JWTs are stateless, we can't invalidate them server-side.
  // The client should simply delete the token on logout.
}

User.getUserById = async function(id) {
  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const users = db.collection('users');
    const user = await users.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return { message: 'User not found' };
    }
    delete user.password
    return user;
  } catch (err) {
    console.error('❌ Mongo error:', err);
    throw err; // re-throw the error to be caught by the controller's try-catch
  }
}

User.updateUser = async function (id, updatedFields) {
  // if we're updating the password, we need to hash it before saving to the db
  if (updatedFields.password) {
    updatedFields.password = await User.hashPassword(updatedFields.password);
  }

  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const users = db.collection('users');
    const response = await users.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedFields },
    );

    if (!response.acknowledged) {
      throw new Error('Failed to update user');
    }

    if (response.matchedCount === 0) {
      return { matchedCount: response.matchedCount, message: 'User not found' };
    }

    if (response.modifiedCount === 0) {
      return { modifiedCount: response.modifiedCount, message: 'No changes made to the user' };
    }
    
    return { modifiedCount: response.modifiedCount, message: 'User updated successfully' };
  } catch (err) {
    console.error('❌ Mongo error:', err);
    throw err; // re-throw the error to be caught by the controller's try-catch
  }
}

User.deleteUser = async function (id) {
  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const users = db.collection('users');
    const response = await users.deleteOne({ _id: new ObjectId(id) });
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
        
    if (!response.acknowledged) {
      throw new Error('Failed to delete user');
    }

    if(response.deletedCount === 0) {
      return { deletedCount: 0, message: 'User not found' };
    }
      
    return { deletedCount: response.deletedCount, message: 'User deleted successfully' };
  } catch (err) {
    console.error('❌ Mongo error:', err);
    throw err; // re-throw the error to be caught by the controller's try-catch
  }
}

User.hashPassword = async function(password) {
  const salt = await bcrypt.genSalt(BCRYPT_WORK_FACTOR);
  return await bcrypt.hash(password, salt);
}

module.exports = User;

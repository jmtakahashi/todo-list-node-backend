const { connectDB } = require('../config/db');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config/config');
const { ObjectId } = require('mongodb');
const validator = require('validator');
const { USERNAME_REGEX, PASSWORD_REGEX } = require('../utils/regex');


function User(username, email, password) {
  this.username = username;
  this.email = email;
  this.password = password;
};


/* create a new user in the database */
User.register = async function (username, email, password) {
  // cleanup
  if (typeof email !== 'string') { return { error: 'Invalid email address.' }; }
  if (typeof username !== 'string') { return { error: 'Invalid username.' }; }
  if (typeof password !== 'string') { return { error: 'Invalid password.' }; }

  email = email.trim().toLowerCase();
  username = username.trim().toLowerCase();
  password = password.trim();

  // validate
  if (email === '' ) { return { error: 'Please provide an email address.' }; }
  if (username === '' ) { return { error: 'Please provide a username.' }; }
  if (password === '' ) { return { error: 'Please provide a password.' }; }

  if (email !== '' && !validator.isEmail(email)) {
    return { error: 'Invalid email address.' };
  }

  if (!USERNAME_REGEX.test(username)) {
    return {
        error:
          'Invalid username format. Username must be 4-30 characters long and can only contain letters, numbers, underscores, and hyphens.',
      };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
        error:
          'Invalid password format. Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      };
  }

  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const usersCollection = db.collection('users');

    // check if user with the same email already exists
    const user = await usersCollection.findOne({ email });

    // let the controller know if the email is already in use so it can return the appropriate error response
    if (user) {
      return { userExists: true,  message: 'Email already exists.' };
    }

    // if user with the same email does NOT exist, proceed to register the user
    const hashedPassword = await User.hashPassword(password);

    const response = await usersCollection.insertOne({
      username,
      email,
      password: hashedPassword,
      isAdmin: false, // default to false.  can only be set to true manually in the database for now
      createdAt: new Date(),
    });

    /*
      - response:
      {
        "acknowledged": true,
        "insertedId": new ObjectId('698bfd18f583137e71a9aece')
      }
    */

    return { _id: response.insertedId, message: 'User registered successfully.' };
  } catch (err) {
    console.error('❌ Mongo error:', err);
    throw err; // re-throw the error to be caught by the controller's try-catch
  }
};


/* retrieve a user by email and validate credentials */
User.login = async function (email, password) {
  // cleanup
  if (typeof email !== 'string') { return { error: 'Invalid credentials.' }; }
  if (typeof password !== 'string') { return { error: 'Invalid credentials.' }; }

  email = email.trim().toLowerCase();
  password = password.trim();

  try {
    const db = await connectDB();
    const usersCollection = db.collection('users');

    // find the user by email
    const user = await usersCollection.findOne({ email });

    // user will be a user object if found, or null if not found
    if (!user) {
      return { user: null, message: 'User not found.' };
    }

    const isValid = await User.verifyPassword(password, user.password);

    if (!isValid) {
      return { user: null, message: 'Invalid password.' };
    }

    delete user.password; // remove password before returning the user object (for security reasons)

    return { user, message: 'Login successful.' };
  } catch (err) {
    console.error('❌ Mongo error:', err);
    throw err; // re-throw the error to be caught by the controller's try-catch
  }
};


/* logout a logged in user */
User.logout = async function () {
  // Since JWTs are stateless, we can't invalidate them server-side, so no db actions.
};


User.getAllUsers = async function () {
  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const usersCollection = db.collection('users');
    const usersCursor = await usersCollection.find({}, { projection: { password: 0 } }); // exclude password field
    const users = await usersCursor.toArray();

    return { users };
  } catch (err) {
    console.error('❌ Mongo error:', err);
    throw err; // re-throw the error to be caught by the controller's try-catch
  }
};


/* retrieve a user by id - does NOT return password */
User.getUserById = async function (userId) {
  // cleanup
  if (typeof userId !== 'string') {
    return { error: 'Invalid user id.' };
  }

  userId = userId.trim();

  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } },
    );

    // user will be a user object if found, or null if not found

    if (!user) {
      return { user: null, message: "User not found."}
    }

    return { user };
  } catch (err) {
    console.error('❌ Mongo error:', err);
    throw err; // re-throw the error to be caught by the controller's try-catch
  }
};


/* retrieve a user by email - does NOT return password */
User.getUserByEmail = async function (email) {
  // cleanup
  if (typeof email !== 'string') { return { error: 'Invalid email address.' }; }

  email = email.trim().toLowerCase();

  // validate
  if (email !== '' && !validator.isEmail(email)) {
    return { error: 'Invalid email address.' };
  }

  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne(
      { email },
      { projection: { password: 0 } },
    );

    // user will be a user object if found, or null if not found

    if (!user) {
      return { user: null, message: 'User not found.' };
    }

    return { user };
  } catch (err) {
    console.error('❌ Mongo error:', err);
    throw err; // re-throw the error to be caught by the controller's try-catch
  }
};


/* update a user in the database */
User.updateUser = async function (userId, updatedFields) {
  // sanitize input by only allowing certain fields to be updated
  const allowedFields = ['username', 'password'];
  Object.keys(updatedFields).forEach((key) => {
    if (!allowedFields.includes(key)) {
      delete updatedFields[key];
    }
  });

  // if no fields left after cleaning, return error
  if (Object.keys(updatedFields).length === 0) { 
    return { error: 'No updated data provided.' };
  }

  // cleanup userId
  if (typeof userId !== 'string') {
    return { error: 'Invalid user id.' };
  }
  userId = userId.trim();

  const fieldsToUpdate = { };

  // if a username field is provided
  if (Object.keys(updatedFields).includes('username')) {
    if (typeof updatedFields.username !== 'string') {
      return { error: 'Invalid username.' };
    }

    if (updatedFields.username === '') {
      return { error: 'Please provide a username.' };
    }

    updatedFields.username = updatedFields.username.trim().toLowerCase();

    if (!USERNAME_REGEX.test(updatedFields.username)) {
      return {
        error:
          'Invalid username format. Username must be 3-30 characters long and can only contain letters, numbers, underscores, and hyphens.',
      };
    }

    // add username to our fieldsToUpdate object since it passed validation
    fieldsToUpdate['username'] = updatedFields.username;
  }

  // if a password field is provided
  if (Object.keys(updatedFields).includes('password')) {
    if (typeof updatedFields.password !== 'string') {
      return { error: 'Invalid password.' };
    }

    if (updatedFields.password === '') {
      return { error: 'Please provide a password.' };
    }

    updatedFields.password = updatedFields.password.trim();

    if (!PASSWORD_REGEX.test(updatedFields.password)) {
      return {
        error:
          'Invalid password format. Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      };
    
    }
    updatedFields.password = await User.hashPassword(updatedFields.password);

    // add password to our fieldsToUpdate object since it passed validation
    fieldsToUpdate["password"] = updatedFields.password;
  }

  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const usersCollection = db.collection('users');
    const response = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
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
      throw new Error('Failed to update user.');
    }

    if (response.matchedCount === 0) {
      return { matchedCount: response.matchedCount, message: 'User not found.' };
    }

    if (response.modifiedCount === 0) {
      return {
        modifiedCount: response.modifiedCount,
        message: 'No changes made to the user.',
      };
    }

    return {
      modifiedCount: response.modifiedCount,
      message: 'User updated successfully.',
    };
  } catch (err) {
    console.error('❌ Mongo error:', err);
    throw err; // re-throw the error to be caught by the controller's try-catch
  }
};


/* remove a user from the database */
User.deleteUser = async function (userId) {
  userId = userId.trim();
  if (typeof userId !== 'string') { userId = ''; }

  try {
    const db = await connectDB(); // ✅ make sure connection is ready
    const usersCollection = db.collection('users');
    const response = await usersCollection.deleteOne({ _id: new ObjectId(userId) });

    /*
      - throws an error if invalid id format is provided
      - if valid id format is provided, response will be:
      {
        "acknowledged": true,
        "deletedCount": 1 or 0
      }
    */

    if (!response.acknowledged) {
      throw new Error('Failed to delete user.');
    }

    if (response.deletedCount === 0) {
      return { deletedCount: response.deletedCount, message: 'User not found.' };
    }

    return {
      deletedCount: response.deletedCount,
      message: 'User deleted successfully.',
    };
  } catch (err) {
    console.error('❌ Mongo error:', err);
    throw err; // re-throw the error to be caught by the controller's try-catch
  }
};


User.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(BCRYPT_WORK_FACTOR);
  return await bcrypt.hash(password, salt);
};


User.verifyPassword = async function (recievedPassword, storedPassword) {
  return await bcrypt.compare(recievedPassword, storedPassword);
};


module.exports = User;

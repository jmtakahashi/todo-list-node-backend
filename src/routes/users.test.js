// testing users routes

process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../app'); // Import the Express app
const { connectDB, disconnectDB } = require('../config/db');

const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config/config');
const jwt = require('jsonwebtoken');
const {
  ACCESS_TOKEN_SECRET_KEY,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_EXPIRY,
} = require('../config/config');

// before each should create a test user entry in the db to test with
// after each we should clear the users collection to avoid conflicts with other tests

let usersCollection; // this is the users collection.  we need to access it in different funcs, so we set globally
let testUserId;
let invalidId;
let testUserAccessToken;
let testUserRefreshToken;
let testUser2Id;

beforeAll(async () => {
  const db = await connectDB();
  usersCollection = db.collection('users');
});

beforeEach(async () => {
  const hashedPassword = await bcrypt.hash('Password123!', BCRYPT_WORK_FACTOR);

  // test user 1
  const userOne = await usersCollection.insertOne({
    username: 'test',
    email: 'test@test.com',
    password: hashedPassword,
    createdAt: new Date(),
  });

  testUserId = userOne.insertedId;
  invalidId = testUserId.toString().slice(0, -2) + '00'; // change the last 2 chars to make it a valid format but non-existent id

  testUserAccessToken = jwt.sign(
    { id: userOne.insertedId, username: 'test' },
    ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );
  testUserRefreshToken = jwt.sign(
    { id: userOne.insertedId },
    REFRESH_TOKEN_SECRET_KEY,
    { expiresIn: REFRESH_TOKEN_EXPIRY },
  );

  // test user 2
  const userTwo = await usersCollection.insertOne({
    username: 'test2',
    email: 'test2@test.com',
    password: hashedPassword,
    createdAt: new Date(),
  });

  testUser2Id = userTwo.insertedId;
});

afterEach(async () => {
  await usersCollection.deleteMany({});
});

afterAll(async () => {
  await disconnectDB();
});

/* POST /users/checkExistingUser - uses email */
describe('POST /users/checkExistingUser', () => {
  test('Check for an existing user with email returns true', async () => {
    const response = await request(app).post('/users/checkExistingUser').send({
      email: 'test@test.com',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(true);
  });

  test('Check for an existing user with non-existent email returns false', async () => {
    const response = await request(app).post('/users/checkExistingUser').send({
        email: 'nonexistent@test.com',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(false);
  });

  test('Check for an existing user with missing data returns 400', async () => {
    const response = await request(app).post('/users/checkExistingUser').send({
        // empty body
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Email required.');
  });

  test('Check for an existing user with empty email value returns 400', async () => {
    const response = await request(app).post('/users/checkExistingUser').send({
        email: '',
    });
    
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Email required.');
  });

  test('Check for an existing user with malformed email value returns 400', async () => {
    const response = await request(app).post('/users/checkExistingUser').send({
        email: ['notanemail'],
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid email address.');
  });
});

/* GET /users/:id */
describe('GET /users/:id', () => {
  test('Successfully gets a user with a valid id.', async () => {
    const response = await request(app)
      .get(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${testUserAccessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.user).toBeTruthy();
    expect(response.body.user).not.toHaveProperty('password');
  });

  test('Get a user with an invalid id, but proper id format returns 404', async () => {
    const response = await request(app)
      .get(`/users/${invalidId}`)
      .set('Authorization', `Bearer ${testUserAccessToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  test('Get a user with malformed id returns 500', async () => {
    const response = await request(app)
      .get(`/users/asdfasdfasdf0987098`)
      .set('Authorization', `Bearer ${testUserAccessToken}`);

    expect(response.statusCode).toBe(500);
  });

  test('Trying to view another users information returns a 401', async () => {
    const response = await request(app)
      .get(`/users/${testUser2Id}`)
      .set('Authorization', `Bearer ${testUserAccessToken}`);

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe(
      'Unauthorized.  You are not authorized.',
    );
  });
});

/* PATCH /users/:id */
describe('PATCH /users/:id', () => {
  test('Successfully updates a user with valid id and data.', async () => { 
    const response = await request(app).patch(`/users/${testUserId}`).set('Authorization', `Bearer ${testUserAccessToken}`).send({
      username: 'updatedTest',
      password: 'UpdatedPassword123!',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('User updated successfully');
  });

  test('Successfully updates a user with only one updated data field.', async () => { 
    const response = await request(app).patch(`/users/${testUserId}`).set('Authorization', `Bearer ${testUserAccessToken}`).send({
      username: 'updatedTest'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('User updated successfully');
  });
 
  test('Returns a 400 if no data sent', async () => { 
    const response = await request(app).patch(`/users/${testUserId}`).set('Authorization', `Bearer ${testUserAccessToken}`).send({
      // empty body
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Updated fields required');
  });

  test('Returns a 400 if empty fields sent', async () => { 
    const response = await request(app)
      .patch(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${testUserAccessToken}`)
      .send({
        username: '',
        password: '',
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Updated fields required');
  });

  test('Returns a 400 if invalid username data sent', async () => { 
    const response = await request(app)
      .patch(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${testUserAccessToken}`)
      .send({
        username: ['invalidUsername'],
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid username');
  });

  test('Returns a 400 if invalid password data sent', async () => { 
    const response = await request(app)
      .patch(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${testUserAccessToken}`)
      .send({
        password: ['invalidPassword'],
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid password');
  });

  test('Returns a 400 if username length too short', async () => { 
    const response = await request(app)
      .patch(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${testUserAccessToken}`)
      .send({
        username: 'te',
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain('Invalid username format');
  });

  test('Returns a 400 if username begins with a number', async () => { 
    const response = await request(app)
      .patch(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${testUserAccessToken}`)
      .send({
        username: '1test',
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain('Invalid username format');
  });

  test('Returns a 400 if invalid password format sent', async () => { 
    const response = await request(app)
      .patch(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${testUserAccessToken}`)
      .send({
        password: 'weak',

      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain('Invalid password format');
  });

  test('Returns a 401 if trying to update another users info', async () => { 
    const response = await request(app)
      .patch(`/users/${testUser2Id}`)
      .set('Authorization', `Bearer ${testUserAccessToken}`)
      .send({
        password: 'weak',

      });
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toContain(
      'Unauthorized.  You are not authorized.',
    );
  });
});

/* DELETE /users/:id */
describe('DELETE /users/:id', () => {
  test('Delete user with valid id', async () => {
    const response = await request(app)
      .delete(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${testUserAccessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('User deleted successfully');
  });

  // TODO: the below tests have to do with improper data formats, we can test this in the model, or sanitize data in the controller
  // test('Delete user with invalid id, but proper id format returns 404', async () => {
  //   const response = await request(app)
  //     .delete(`/users/${invalidId}`)
  //     .set('Authorization', `Bearer ${testUserAccessToken}`);
    
  //   expect(response.statusCode).toBe(404);
  //   expect(response.body.message).toBe('User not found');
  // });

  // test('Delete user with invalid mongo id format returns 500', async () => {
  //   const response = await request(app)
  //     .delete(`/users/0asdfasdf00`)
  //     .set('Authorization', `Bearer ${testUserAccessToken}`);

  //   expect(response.statusCode).toBe(500);
  // });

  test('Returns a 401 if trying to delete another user', async () => {
    const response = await request(app)
      .delete(`/users/${testUser2Id}`)
      .set('Authorization', `Bearer ${testUserAccessToken}`);

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe(
      'Unauthorized.  You are not authorized.',
    );
  });
});
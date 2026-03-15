// testing auth routes

process.env.NODE_ENV = 'test';
const request = require('supertest');
const cookies = request.cookies;
const app = require('../app'); // Import the Express app
const {connectDB, disconnectDB } = require('../config/db');

const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config/config');
const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET_KEY, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET_KEY, REFRESH_TOKEN_EXPIRY } = require('../config/config');

// before each should create a test user and token to test with
// after each we should clear the created user and all users

let usersCollection; // this is the users collection.  we need to access it in different funcs, so we set globally
let testUserAccessToken;
let testUserRefreshToken;

beforeAll(async () => {
  const db = await connectDB();
  usersCollection = db.collection('users');
});

beforeEach(async () => {
  const hashedPassword = await bcrypt.hash('Password123!', BCRYPT_WORK_FACTOR)

  const response = await usersCollection.insertOne({
    username: 'test',
    email: 'test@test.com',
    password: hashedPassword,
    createdAt: new Date(),
  });

  testUserAccessToken = jwt.sign({ id: response.insertedId, username: 'test' }, ACCESS_TOKEN_SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRY });
  testUserRefreshToken = jwt.sign({ id: response.insertedId }, REFRESH_TOKEN_SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRY });
});

afterEach(async () => {
  await usersCollection.deleteMany({});
});

afterAll(async () => {
  await disconnectDB();
});


/* POST /auth/register */
describe('POST /auth/register', () => {
  test('Register a new user successfully', async () => {
    const response = await request(app).post('/auth/register').send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'TestPassword123!'
    });
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toEqual(expect.objectContaining({ accessToken: expect.any(String) }));
    expect(cookies.set({ name: 'refreshToken'}));
  });

  test('Register with missing parameters returns a 400 error', async () => {
    const response = await request(app).post('/auth/register').send({
        // empty body
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Username, email, and password are required.');
  })

  test('Register with empty parameters returns a 400 error', async () => {
    const response = await request(app).post('/auth/register').send({
        username: '',
        email: '',
        password: ''
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Username, email, and password are required.');
  })

  test('Register with an existing email returns a 409 error', async () => {
    const response = await request(app).post('/auth/register').send({
      username: 'testuser',
      email: 'test@test.com',
      password: 'TestPassword123!',
    });
    expect(response.statusCode).toBe(409);
    expect(response.body.message).toBe('Email already exists');
  })
});

/* POST /auth/login */
describe('POST /auth/login', () => { 
  test('Login successfully', async () => {
    const response = await request(app).post('/auth/login').send({
        email: 'test@test.com',
        password: 'Password123!',
    })
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.message).toBe('Login successful');
    expect(cookies.set({ name: 'refreshToken' }));
  })

  test('Login with missing parameters returns a 400 error', async () => {
    const response = await request(app).post('/auth/login').send({
        // empty body
    })
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Email and password are required.');
  })

  test('Login with empty parameters returns a 400 error', async () => {
    const response = await request(app).post('/auth/login').send({
      email: '',
      password: '',
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Email and password are required.');
  });

  test('Login with incorrect email returns a 401 error', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'wrongemail@test.com',
      password: 'Password123!',
    });
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });

  test('Login with incorrect password returns a 401 error', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'test@test.com',
      password: 'wrongpassword',
    });
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });
})

/* POST /auth/logout */
describe('POST /auth/logout', () => {
  test('Logout returns and 200 and removes cookies', async () => {
    const response = await request(app).post('/auth/logout');

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Logout successful');

    // check that the refresh token cookie is cleared
    const cookies = response.headers['set-cookie'];
    expect(cookies).toEqual(
      expect.arrayContaining([
        expect.stringContaining('refreshToken=;'),
      ])
    );
  });
});
    
/* GET /auth/refresh */
describe('GET /auth/refresh', () => {
  test('Refresh with a valid refresh token returns a new access token', async () => {
    const response = await request(app).get('/auth/refresh').set('Cookie', `refreshToken=${testUserRefreshToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
  });

  test('Refresh with an invalid refresh token returns a 403', async () => {
    const invalidUserRefreshToken = testUserRefreshToken.slice(0, -1) + 'x'; // modify the valid token to make it invalid

    const response = await request(app).get('/auth/refresh').set('Cookie', `refreshToken=${invalidUserRefreshToken}`);
    
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden. Invalid or expired refresh token.');
  });

  test('Refresh without a valid refresh token returns a 401', async () => {
    const response = await request(app).get('/auth/refresh');
    
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe(
      'Unauthorized. No refresh token provided.',
    );
  });
});

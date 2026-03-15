// testing todos routes

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

// before each should create a test todo entry in the db to test with
// after each we shlould clear the todos collection to avoid conflicts with other tests

let todosCollection; // this is the todos collection.  we need to access it in different funcs, so we set globally
let usersCollection; // we also need access to the users collection to create a test user for the todos to belong to
let testUserId;
let invalidId;
let testUserAccessToken;
let testUserRefreshToken;
let testTodoId;
let invalidTodoId;

beforeAll(async () => {
  const db = await connectDB();
  todosCollection = db.collection('todos');
  usersCollection = db.collection('users');
});

beforeEach(async () => {
  const hashedPassword = await bcrypt.hash('Password123!', BCRYPT_WORK_FACTOR);

  const response = await usersCollection.insertOne({
    username: 'test',
    email: 'test@test.com',
    password: hashedPassword,
    createdAt: new Date(),
  });

  testUserId = response.insertedId;
  invalidId = testUserId.toString().slice(0, -2) + '00'; // change the last 2 chars to make it a valid format but non-existent id

  testUserAccessToken = jwt.sign(
    { id: response.insertedId, username: 'test' },
    ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );

  testUserRefreshToken = jwt.sign(
    { id: response.insertedId },
    REFRESH_TOKEN_SECRET_KEY,
    { expiresIn: REFRESH_TOKEN_EXPIRY },
  );

  const { insertedId } = await todosCollection.insertOne({
    task: 'Test task',
    completed: false,
    createdAt: new Date(),
    ownerId: testUserId.toString()
  });

  
  testTodoId = insertedId
  invalidTodoId = testTodoId.toString().slice(0, -2) + '00'; // change the last 2 chars to make it a valid format but non-existent id
});

afterEach(async () => {
  await todosCollection.deleteMany({});
});

// after all should close the db connection
afterAll(async () => {
  await disconnectDB();
});


/* GET /todos/ */
describe('GET /todos/', () => {
  test('Get all todos for the current user', async () => {
    const response = await request(app).get('/todos/').set('Authorization', `Bearer ${testUserAccessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.todos.length).toBe(1);
    expect(response.body.todos[0]).toHaveProperty('task', 'Test task');
    expect(response.body.todos[0]).toHaveProperty('completed', false);
  })

  test('Returns a 401 for request without a valid access token', async () => {
    const response = await request(app).get('/todos/');

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized. No access token provided.');
  });
})

/* POST /todos/ */
describe('POST /todos/', () => {
  test('Create a new todo for the current user', async () => {
    const response = await request(app).post('/todos/').set('Authorization', `Bearer ${testUserAccessToken}`).send({
      task: 'Test task 2'
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Todo created successfully');
    expect(response.body).toHaveProperty('newTodo');
    expect(response.body.newTodo).toHaveProperty('task', 'Test task 2');
    expect(response.body.newTodo).toHaveProperty('completed', false);

    // check that the new todo is actually in the db
    const response2 = await request(app).get('/todos/').set('Authorization', `Bearer ${testUserAccessToken}`);
    
    expect(response2.body.todos.length).toBe(2)
  });

  test('Returns a 400 for request if body is empty', async () => {
    const response = await request(app).post('/todos/').set('Authorization', `Bearer ${testUserAccessToken}`).send({
      // empty task value
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Task is required');
  });

  test('Returns a 400 for request if task is empty', async () => {
    const response = await request(app).post('/todos/').set('Authorization', `Bearer ${testUserAccessToken}`).send({
      task: ''
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Task is required');
  });

  test('Returns a 400 for request if task data is malformed', async () => {
    const response = await request(app).post('/todos/').set('Authorization', `Bearer ${testUserAccessToken}`).send({
      task: ['notatask']
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid task value');
  });
});

/* PATCH /todos/:id */
describe('PATCH /todos/:id', () => {
  test('Successfully update a todo for the current user with proper data', async () => {
    const response = await request(app).patch(`/todos/${testTodoId}`).set('Authorization', `Bearer ${testUserAccessToken}`).send({
      task: 'Updated task',
      completed: true
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Todo updated successfully');

    // check that the todo is actually updated in the db
    const response2 = await request(app).get('/todos/').set('Authorization', `Bearer ${testUserAccessToken}`);
    
    expect(response2.body.todos[0]).toHaveProperty('task', 'Updated task');
    expect(response2.body.todos[0]).toHaveProperty('completed', true);

  });

  test('Returns a 400 status if updated data is non existent', async () => {
    const response = await request(app).patch(`/todos/${testTodoId}`).set('Authorization', `Bearer ${testUserAccessToken}`).send({
        // empty task value
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Updated fields required');
  });

  test('Returns a 400 status if updated field are empty', async () => {
    const response = await request(app).patch(`/todos/${testTodoId}`).set('Authorization', `Bearer ${testUserAccessToken}`).send({
      task: '',
      completed: ''
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Updated fields required');
  });

  test('Returns a 400 for request if updated task is malformed', async () => {
    const response = await request(app).patch(`/todos/${testTodoId}`).set('Authorization', `Bearer ${testUserAccessToken}`).send({
        task: ['notatask'],
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid task value');
  });

  test('Returns a 400 for request if updated completed is not a boolean', async () => {
    const response = await request(app).patch(`/todos/${testTodoId}`).set('Authorization', `Bearer ${testUserAccessToken}`).send({
        completed: 'true',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid completed value');
  });
});

/* DELETE /todos/:id */
describe('DELETE /todos/:id', () => {
  test('Delete a todo for the current user', async () => {
    const response = await request(app).delete(`/todos/${testTodoId}`).set('Authorization', `Bearer ${testUserAccessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Todo deleted successfully');

    const todo = await request(app).get('/todos/').set('Authorization', `Bearer ${testUserAccessToken}`);

    expect(todo.body.todos.length).toBe(0);
  })

  test('Returns a 404 status if the todo does not exist', async () => {
    const response = await request(app).delete(`/todos/${invalidTodoId}`).set('Authorization', `Bearer ${testUserAccessToken}`);

    expect(response.statusCode).toBe(404);
  });
});


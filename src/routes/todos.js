const express = require('express');
const controller = require('../controllers/todosController');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateJWT); // check for valid JWT and attach user to req if valid

router.get('/', controller.getAllTodos);
router.post('/addTodo', controller.addTodo);
router.patch('/:id', controller.updateTodo);
router.delete('/:id', controller.deleteTodo);

module.exports = router;
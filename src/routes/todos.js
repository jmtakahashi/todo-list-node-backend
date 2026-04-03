const express = require('express');
const todosController = require('../controllers/todosController');
const { requireLoggedIn, requireCorrectUser } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(requireLoggedIn);

router.get('/', requireCorrectUser, todosController.getAllTodosByList);
router.post('/', todosController.createTodo);
router.patch('/:todoId', requireCorrectUser, todosController.updateTodo);
router.delete('/:todoId', requireCorrectUser, todosController.deleteTodo);

module.exports = router;
const express = require('express');
const todosController = require('../controllers/todosController');
const { requireLoggedIn, requireCorrectUser } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(requireLoggedIn);
router.use(requireCorrectUser);

router.get('/', todosController.getAllTodosByList);
router.get('/:todoId', todosController.getSingleTodo);
router.post('/', todosController.createTodo);
router.patch('/:todoId', todosController.updateTodo);
router.delete('/:todoId', todosController.deleteTodo);

module.exports = router;
const express = require('express');
const controller = require('../controllers/todosController');

const router = express.Router();

router.get('/', controller.getAllTodos);
router.post('/addTodo', controller.addTodo);
router.get('/:id', controller.getTodoById);
router.patch('/:id', controller.updateTodo);
router.delete('/:id', controller.deleteTodo);

module.exports = router;
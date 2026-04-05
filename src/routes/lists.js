const express = require('express');
const listsController = require('../controllers/listsController');
const { requireLoggedIn, requireCorrectUser } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(requireLoggedIn);
router.use(requireCorrectUser); // checks that the jwt payload matches the userId in the route params.

router.get('/', listsController.getAllListsByUser);
router.get('/:listId', listsController.getSingleList);
router.post('/', listsController.createList);
router.patch('/:listId', listsController.updateList,);
router.delete('/:listId', listsController.deleteList,);

module.exports = router;

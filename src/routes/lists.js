const express = require('express');
const listsController = require('../controllers/listsController');
const { requireLoggedIn, requireCorrectUser } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(requireLoggedIn);

router.get('/', requireCorrectUser, listsController.getAllLists);
router.get('/:listId', requireCorrectUser, listsController.getSingleList);
router.post('/', listsController.createList);
router.patch('/:listId',requireCorrectUser,listsController.updateList,);
router.delete('/:listId', requireCorrectUser, listsController.deleteList,);

module.exports = router;

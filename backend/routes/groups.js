const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createGroup, getGroups, getGroup, addMember, joinGroup, deleteGroup } = require('../controllers/groupController');

router.use(authMiddleware);

router.post('/', createGroup);
router.get('/', getGroups);
router.get('/:id', getGroup);
router.post('/join', joinGroup);
router.post('/:id/members', addMember);
router.delete('/:id', deleteGroup);

module.exports = router;

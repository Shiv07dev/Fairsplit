const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createSettlement, getGroupSettlements, getFairnessScore, getNotifications, markNotificationsRead } = require('../controllers/settlementController');

router.use(authMiddleware);

router.post('/', createSettlement);
router.get('/group/:group_id', getGroupSettlements);
router.get('/group/:group_id/fairness', getFairnessScore);
router.get('/notifications', getNotifications);
router.put('/notifications/read', markNotificationsRead);

module.exports = router;

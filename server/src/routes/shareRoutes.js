const express = require('express');
const router = express.Router();
const {
  shareCalendar,
  getShares,
  deleteShare
} = require('../controllers/shareController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/', shareCalendar);
router.get('/', getShares);
router.delete('/:id', deleteShare);

module.exports = router;

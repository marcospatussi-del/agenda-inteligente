const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getDashboardSummary,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  exportIcs
} = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', getAppointments);
router.get('/summary', getDashboardSummary);
router.get('/:id/export-ics', exportIcs);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router;

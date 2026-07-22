const express = require('express');
const router = express.Router();
const {
  getTodayConfirmations,
  handleConfirmationAction
} = require('../controllers/confirmationController');
const { sendDailyDigest } = require('../services/emailService');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/today', getTodayConfirmations);
router.post('/:appointmentId/action', handleConfirmationAction);

// Manual trigger for testing email notifications
router.post('/trigger-email', async (req, res) => {
  try {
    const period = req.body.period || '07:00';
    await sendDailyDigest(period);
    return res.json({ message: `Emails do período (${period}) disparados com sucesso.` });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao disparar e-mails.' });
  }
});

module.exports = router;

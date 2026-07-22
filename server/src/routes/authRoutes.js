const express = require('express');
const router = express.Router();
const { register, login, googleLogin, getProfile, updateProfile, updateSettings } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', authenticateToken, getProfile);
router.put('/me', authenticateToken, updateProfile);
router.put('/settings', authenticateToken, updateSettings);

module.exports = router;

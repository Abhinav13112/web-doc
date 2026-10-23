const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getProfile } = require('../controllers/userController');

// All user routes require authentication
router.use(requireAuth);

router.get('/profile', getProfile);

module.exports = router;

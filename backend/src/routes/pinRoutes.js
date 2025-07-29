const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createPin, getUserPins } = require('../controllers/pinController');

// POST /pins - Create a new pin (authenticated users)
router.post('/', authenticate, createPin);

// GET /pins/:userId - Get all pins for a specific user (authenticated users)
router.get('/:userId', authenticate, getUserPins);

module.exports = router; 
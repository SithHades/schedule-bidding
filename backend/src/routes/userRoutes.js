const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { registerUser, getAllUsers, updateUser } = require('../controllers/userController');

// POST /users - Register new user (admin only)
router.post('/', authenticate, requireAdmin, registerUser);

// GET /users - List all users (admin only)
router.get('/', authenticate, requireAdmin, getAllUsers);

// PATCH /users/:id - Update user role or contractPercent (admin only)
router.patch('/:id', authenticate, requireAdmin, updateUser);

module.exports = router; 
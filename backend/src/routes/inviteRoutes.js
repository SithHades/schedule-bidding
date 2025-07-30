const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { 
  createInvite, 
  getInviteByToken, 
  signupViaInvite, 
  getAllInvites 
} = require('../controllers/inviteController');

// Admin only - create a new invite
router.post('/', authenticate, requireAdmin, createInvite);

// Admin only - get all invites
router.get('/', authenticate, requireAdmin, getAllInvites);

// Public - get invite details by token
router.get('/:token', getInviteByToken);

// Public - signup using invite token
router.post('/signup', signupViaInvite);

module.exports = router; 
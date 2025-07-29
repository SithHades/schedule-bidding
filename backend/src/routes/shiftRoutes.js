const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { 
  getShiftsByWindow, 
  getShiftStats, 
  createShift, 
  createBulkShifts,
  updateShiftWeight
} = require('../controllers/shiftController');

// GET /shifts?windowId=xyz - List all shifts in a window (authenticated users)
router.get('/', authenticate, getShiftsByWindow);

// POST /shifts - Create a single shift (admin only)
router.post('/', authenticate, requireAdmin, createShift);

// POST /shifts/bulk - Create multiple shifts (admin only)
router.post('/bulk', authenticate, requireAdmin, createBulkShifts);

// PATCH /shifts/:id/weight - Update shift weight (admin only)
router.patch('/:id/weight', authenticate, requireAdmin, updateShiftWeight);

// GET /shift-stats - Get all shifts with pin counts (admin only)
router.get('/shift-stats', authenticate, requireAdmin, getShiftStats);

module.exports = router; 
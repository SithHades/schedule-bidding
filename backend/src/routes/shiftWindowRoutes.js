const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { 
  createShiftWindow, 
  getAllShiftWindows, 
  updateShiftWindow, 
  deleteShiftWindow 
} = require('../controllers/shiftWindowController');

// POST /shift-windows - Create a new shift window (admin only)
router.post('/', authenticate, requireAdmin, createShiftWindow);

// GET /shift-windows - List all shift windows (authenticated users can view)
router.get('/', authenticate, getAllShiftWindows);

// PATCH /shift-windows/:id - Update a shift window (admin only)
router.patch('/:id', authenticate, requireAdmin, updateShiftWindow);

// DELETE /shift-windows/:id - Delete a shift window (admin only)
router.delete('/:id', authenticate, requireAdmin, deleteShiftWindow);

module.exports = router; 
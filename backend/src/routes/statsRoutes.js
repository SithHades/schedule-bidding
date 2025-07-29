const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getUserStats, getAdminDashboard } = require('../controllers/statsController');

// GET /user-stats/:userId - Get user statistics (authenticated users)
router.get('/user-stats/:userId', authenticate, getUserStats);

// GET /admin/dashboard - Get admin dashboard data (admin only)
router.get('/admin/dashboard', authenticate, requireAdmin, getAdminDashboard);

module.exports = router; 
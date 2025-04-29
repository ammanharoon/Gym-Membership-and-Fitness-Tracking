// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdminToken } = require('../middleware/adminAuthMiddleware');

// Public admin routes
router.post('/login', adminController.adminLogin);

// Protected admin routes (require authentication)
router.get('/validate-token', verifyAdminToken, adminController.validateAdminToken);
router.get('/stats', verifyAdminToken, adminController.getDashboardStats);
router.get('/profile', verifyAdminToken, adminController.getProfile);
router.post('/change-password', verifyAdminToken, adminController.changePassword);
router.post('/logout', adminController.adminLogout);

module.exports = router;
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const { validateLogin, validateProfileUpdate, validatePasswordChange, validateStudentRegistration, validateAdminRegistration } = require('../middleware/validation');

// Public routes
router.post('/login', validateLogin, authController.login);
router.post('/register-student', validateStudentRegistration, authController.registerStudent);

// Protected routes
router.post('/logout', authenticateToken, authController.logout);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validateProfileUpdate, authController.updateProfile);
router.put('/change-password', authenticateToken, validatePasswordChange, authController.changePassword);

// Admin-only routes
router.post('/register-admin', authenticateToken, authorizeAdmin, validateAdminRegistration, authController.registerAdmin);

module.exports = router;

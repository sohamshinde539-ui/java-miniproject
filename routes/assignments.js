const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticateToken, authorizeAdmin, authorizeUser } = require('../middleware/auth');
const { validateAssignment } = require('../middleware/validation');

// All assignment routes require authentication
router.use(authenticateToken);

// Routes accessible by both admin and students
router.get('/', authorizeUser, assignmentController.getAssignments);
router.get('/:id', authorizeUser, assignmentController.getAssignmentById);
router.put('/:id', authorizeAdmin, assignmentController.updateAssignment);

// Admin-only routes
router.post('/', authorizeAdmin, validateAssignment, assignmentController.createAssignment);
router.delete('/:id', authorizeAdmin, assignmentController.deleteAssignment);

module.exports = router;
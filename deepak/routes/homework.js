const express = require('express');
const router = express.Router();
const homeworkController = require('../controllers/homeworkController');
const { authenticateToken, authorizeAdmin, authorizeUser } = require('../middleware/auth');
const { validateHomework } = require('../middleware/validation');

// All homework routes require authentication
router.use(authenticateToken);

// Routes accessible by both admin and students
router.get('/', authorizeUser, homeworkController.getHomework);
router.get('/:id', authorizeUser, homeworkController.getHomeworkById);
router.put('/:id', authorizeAdmin, homeworkController.updateHomework);

// Admin-only routes
router.post('/', authorizeAdmin, validateHomework, homeworkController.createHomework);
router.delete('/:id', authorizeAdmin, homeworkController.deleteHomework);

module.exports = router;
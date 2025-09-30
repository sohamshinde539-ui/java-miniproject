const { body } = require('express-validator');

// Login validation
const validateLogin = [
    body('username')
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

// Profile update validation
const validateProfileUpdate = [
    body('name')
        .optional({ values: 'falsy' })
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    body('department')
        .optional({ values: 'falsy' })
        .isLength({ min: 2, max: 100 })
        .withMessage('Department must be between 2 and 100 characters'),
    body('division')
        .optional({ values: 'falsy' })
        .isLength({ min: 1, max: 10 })
        .withMessage('Division must be between 1 and 10 characters'),
    body('semester')
        .optional({ values: 'falsy' })
        .isLength({ min: 1, max: 10 })
        .withMessage('Semester must be between 1 and 10 characters'),
    body('emergency_contact_name')
        .optional({ values: 'falsy' })
        .isLength({ min: 2, max: 100 })
        .withMessage('Emergency contact name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Emergency contact name can only contain letters and spaces'),
    body('emergency_contact_relationship')
        .optional({ values: 'falsy' })
        .isLength({ min: 2, max: 50 })
        .withMessage('Emergency contact relationship must be between 2 and 50 characters'),
    body('emergency_contact_phone')
        .optional({ values: 'falsy' })
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please enter a valid phone number (e.g., +1234567890 or 1234567890)')
];

// Password change validation
const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Homework validation
const validateHomework = [
    body('subject')
        .notEmpty()
        .withMessage('Subject is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Subject must be between 2 and 50 characters'),
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),
    body('description')
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
    body('due_date')
        .notEmpty()
        .withMessage('Due date is required')
        .isISO8601()
        .withMessage('Please provide a valid date in YYYY-MM-DD format')
        .custom((value) => {
            const dueDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (dueDate < today) {
                throw new Error('Due date cannot be in the past');
            }
            return true;
        }),
    body('assigned_to')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Assigned to must be a valid user ID'),
    body('status')
        .optional()
        .isIn(['Pending', 'Completed', 'Overdue'])
        .withMessage('Status must be one of: Pending, Completed, Overdue')
];

// Assignment validation (same as homework)
const validateAssignment = validateHomework;

// Homework update validation (for students - only status can be updated)
const validateHomeworkStatusUpdate = [
    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['Pending', 'Completed'])
        .withMessage('Status must be either Pending or Completed')
];

// Assignment update validation (for students - only status can be updated)
const validateAssignmentStatusUpdate = validateHomeworkStatusUpdate;

// Student registration validation
const validateStudentRegistration = [
    body('name')
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    body('username')
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('confirmPassword')
        .notEmpty()
        .withMessage('Please confirm your password')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    body('student_id')
        .optional()
        .isLength({ min: 5, max: 20 })
        .withMessage('Student ID must be between 5 and 20 characters'),
    body('department')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Department must be between 2 and 100 characters'),
    body('division')
        .optional()
        .isLength({ min: 1, max: 10 })
        .withMessage('Division must be between 1 and 10 characters'),
    body('semester')
        .optional()
        .isLength({ min: 1, max: 10 })
        .withMessage('Semester must be between 1 and 10 characters')
];

// Admin registration validation
const validateAdminRegistration = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    body('username')
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('department')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Department must be between 2 and 100 characters'),
    body('division')
        .optional()
        .isLength({ min: 1, max: 10 })
        .withMessage('Division must be between 1 and 10 characters')
];

module.exports = {
    validateLogin,
    validateProfileUpdate,
    validatePasswordChange,
    validateHomework,
    validateAssignment,
    validateHomeworkStatusUpdate,
    validateAssignmentStatusUpdate,
    validateStudentRegistration,
    validateAdminRegistration
};

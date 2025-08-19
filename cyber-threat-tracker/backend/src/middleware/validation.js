const { body, param, query } = require('express-validator');

const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['admin', 'analyst', 'viewer'])
    .withMessage('Role must be admin, analyst, or viewer'),
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const validateThreatCreation = [
  body('type')
    .isIn(['DDoS', 'Phishing', 'Malware', 'Ransomware', 'Data Breach', 'SQL Injection', 'XSS', 'Social Engineering', 'Other'])
    .withMessage('Invalid threat type'),
  body('location')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Location is required and must be less than 255 characters'),
  body('country')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Country is required and must be less than 100 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('severity')
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Severity must be Low, Medium, or High'),
  body('time_detected')
    .optional()
    .isISO8601()
    .withMessage('Time detected must be a valid date'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('status')
    .optional()
    .isIn(['Active', 'Investigating', 'Resolved', 'False Positive'])
    .withMessage('Invalid status'),
  body('source')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Source must be less than 100 characters'),
];

const validateThreatUpdate = [
  body('type')
    .optional()
    .isIn(['DDoS', 'Phishing', 'Malware', 'Ransomware', 'Data Breach', 'SQL Injection', 'XSS', 'Social Engineering', 'Other'])
    .withMessage('Invalid threat type'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Location must be less than 255 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Country must be less than 100 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('severity')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Severity must be Low, Medium, or High'),
  body('time_detected')
    .optional()
    .isISO8601()
    .withMessage('Time detected must be a valid date'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('status')
    .optional()
    .isIn(['Active', 'Investigating', 'Resolved', 'False Positive'])
    .withMessage('Invalid status'),
  body('source')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Source must be less than 100 characters'),
];

const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
];

const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['time_detected', 'created_at', 'severity', 'type', 'country'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('Sort order must be ASC or DESC'),
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateThreatCreation,
  validateThreatUpdate,
  validateUUID,
  validateQueryParams,
};

const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

const validateLogin = [
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const validateComplaint = [
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('ward_id').notEmpty().withMessage('District is required').isLength({ max: 100 }),
  body('state').trim().notEmpty().withMessage('State/UT is required').isLength({ max: 100 }),
  body('latitude').notEmpty().withMessage('Location required'),
  body('longitude').notEmpty().withMessage('Location required'),
  handleValidationErrors
];

const validateStatusUpdate = [
  body('status').isIn(['assigned', 'in_progress', 'resolved', 'rejected']).withMessage('Invalid status'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateComplaint,
  validateStatusUpdate
};
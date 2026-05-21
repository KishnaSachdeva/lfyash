/**
 * Email Validation Middleware
 * Ensures only @chitkara.edu.in emails can register
 *
 * SYLLABUS CONCEPT: Router-level middleware, Input validation
 * - Validates email domain before processing registration
 * - Returns early with 400 if domain doesn't match
 * - Prevents invalid data from reaching controller
 */

/**
 * Middleware to validate college email domain
 * Must be used before the register controller
 */
const validateEmail = (req, res, next) => {
  const { email } = req.body;

  // Check if email exists
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  // Check if email ends with @chitkara.edu.in
  const collegeEmailRegex = /^[\w.+-]+@chitkara\.edu\.in$/i;

  if (!collegeEmailRegex.test(email)) {
    return res.status(403).json({
      success: false,
      message: 'Registration is only allowed with @chitkara.edu.in email addresses. Please use your college email.',
    });
  }

  // Email is valid, proceed to next middleware/controller
  next();
};

/**
 * Optional: Validate email format (basic check)
 * Can be used for other forms that need email validation
 */
const isValidEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = { validateEmail, isValidEmailFormat };

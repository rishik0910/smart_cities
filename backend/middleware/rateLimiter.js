const rateLimit = require('express-rate-limit');

// General API limit — 100 requests per 15 mins per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again after 15 minutes.' },
});

// Auth routes — max 10 attempts per 15 mins (increased to 1000 in development)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
});

// Submit complaint — max 20 per hour per IP (increased to 1000 in development to prevent blocking during testing)
const complaintLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many complaints submitted. Please try again after an hour.' },
});

module.exports = { apiLimiter, authLimiter, complaintLimiter };
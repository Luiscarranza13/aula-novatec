/**
 * Sanitización contra XSS
 * Mejora #4 — Sanitización contra XSS
 */
const xss = require('xss-clean');

// Sanitiza req.body, req.query y req.params
const sanitize = xss();

module.exports = sanitize;

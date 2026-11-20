/**
 * HTML Sanitization and Escaping Utility
 * Defends against XSS, HTML injection, and mail relay phishing attacks.
 */

const escapeHtml = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

module.exports = {
  escapeHtml,
};

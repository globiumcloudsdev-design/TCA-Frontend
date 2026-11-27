import DOMPurify from 'dompurify';

const escapeText = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Sanitise untrusted HTML (support tickets, rich-text) before it goes into
 * dangerouslySetInnerHTML. If DOMPurify cannot run (no DOM, e.g. during SSR) the
 * value is escaped as plain text instead of being returned unsanitised.
 */
export function sanitizeHtml(html) {
  if (!html) return '';
  if (typeof window === 'undefined' || !DOMPurify.isSupported) return escapeText(html);
  return DOMPurify.sanitize(String(html), {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['style'],
  });
}

/** Escape a value for safe interpolation into HTML text or a quoted attribute (print/popup windows). */
export const escapeHtml = escapeText;

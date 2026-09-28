// Helper utilities for QR Code payload generation, validation, and URL construction

/**
 * Generate a unique short ID for Dynamic QR codes (e.g. `qr_x89a2b`)
 */
export function generateShortId(length = 7) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'qr_';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sanitize and validate URL input
 */
export function normalizeUrl(urlStr) {
  if (!urlStr) return '';
  let trimmed = urlStr.trim();
  if (!/^https?:\/\//i.test(trimmed) && !/^mailto:/i.test(trimmed) && !/^tel:/i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }
  return trimmed;
}

export function isValidUrl(urlStr) {
  try {
    const normalized = normalizeUrl(urlStr);
    new URL(normalized);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Build the full Redirect URL encoded inside the Dynamic QR code.
 * We use `/#/r/${shortId}` or `?r=${shortId}` so it works anywhere!
 */
export function buildDynamicRedirectUrl(shortId) {
  const origin = window.location.origin;
  const path = window.location.pathname.replace(/\/$/, '');
  return `${origin}${path}/#/r/${shortId}`;
}

/**
 * Export data to CSV
 */
export function exportQrListToCsv(qrList) {
  if (!qrList || qrList.length === 0) return;

  const headers = ['ID', 'Title', 'Type', 'Destination URL', 'Redirect URL', 'Active', 'Scans', 'Created At'];
  const rows = qrList.map(item => [
    item.id,
    `"${(item.title || 'Untitled').replace(/"/g, '""')}"`,
    item.qrType || 'dynamic',
    `"${(item.destinationUrl || '').replace(/"/g, '""')}"`,
    `"${buildDynamicRedirectUrl(item.id)}"`,
    item.active ? 'Active' : 'Paused',
    item.scans || 0,
    new Date(item.createdAt || Date.now()).toLocaleString()
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `qr_codes_export_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

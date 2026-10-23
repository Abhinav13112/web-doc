const path = require('path');

// Disallowed dangerous file extensions
const BLOCKED_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.sh', '.bash', '.vbs', '.vbe', 
  '.wsf', '.wsh', '.scr', '.pif', '.com', '.msi', '.msp',
  '.hta', '.cpl', '.jar', '.ps1', '.ps2', '.reg'
]);

// Category classification mappings
const CATEGORY_MAP = {
  // PDFs
  '.pdf': 'pdf',

  // Word Documents
  '.doc': 'word',
  '.docx': 'word',
  '.odt': 'word',
  '.rtf': 'word',
  '.dot': 'word',
  '.dotx': 'word',

  // Spreadsheets
  '.xls': 'spreadsheet',
  '.xlsx': 'spreadsheet',
  '.csv': 'spreadsheet',
  '.ods': 'spreadsheet',
  '.tsv': 'spreadsheet',
  '.xlsm': 'spreadsheet',

  // Presentations
  '.ppt': 'presentation',
  '.pptx': 'presentation',
  '.odp': 'presentation',
  '.pps': 'presentation',
  '.ppsx': 'presentation',

  // Images
  '.jpg': 'image',
  '.jpeg': 'image',
  '.png': 'image',
  '.gif': 'image',
  '.webp': 'image',
  '.svg': 'image',
  '.bmp': 'image',
  '.ico': 'image',
  '.tiff': 'image',

  // Text & Code
  '.txt': 'text',
  '.md': 'text',
  '.markdown': 'text',
  '.json': 'text',
  '.xml': 'text',
  '.yaml': 'text',
  '.yml': 'text',
  '.js': 'text',
  '.jsx': 'text',
  '.ts': 'text',
  '.tsx': 'text',
  '.py': 'text',
  '.html': 'text',
  '.htm': 'text',
  '.css': 'text',
  '.sql': 'text',
  '.log': 'text',

  // Archives
  '.zip': 'archive',
  '.rar': 'archive',
  '.7z': 'archive',
  '.tar': 'archive',
  '.gz': 'archive',
  '.bz2': 'archive'
};

/**
 * Determine category from extension
 */
function getCategoryFromExtension(ext) {
  const normalized = ext ? ext.toLowerCase() : '';
  return CATEGORY_MAP[normalized] || 'other';
}

/**
 * Sanitize filename to prevent directory traversal and remove illegal characters
 */
function sanitizeFilename(originalName) {
  if (!originalName || typeof originalName !== 'string') {
    return 'unnamed_document';
  }
  // Strip path traversal attempts and directory separators
  const baseName = path.basename(originalName);
  // Remove control characters and reserved OS characters
  const cleaned = baseName
    .replace(/[\0\x00-\x1f\x7f<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned || 'document';
}

/**
 * Check if the file extension is strictly disallowed for safety
 */
function isBlockedExtension(ext) {
  if (!ext) return false;
  return BLOCKED_EXTENSIONS.has(ext.toLowerCase());
}

/**
 * Human readable file size formatter
 */
function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Inspect magic bytes (first few bytes of file buffer) for signature validation
 * Prevents disguised executable binaries disguised as documents
 */
function validateBufferSignature(buffer, fileExt) {
  if (!buffer || buffer.length < 4) {
    return { valid: true }; // Small or empty file
  }

  const ext = fileExt ? fileExt.toLowerCase() : '';
  const header = buffer.subarray(0, 16);

  // Check for common malicious executable signatures (PE / MZ executable headers)
  if (header[0] === 0x4D && header[1] === 0x5A) { // "MZ" Windows executable header
    return { valid: false, reason: 'File content resembles a Windows executable binary (.exe/.dll)' };
  }

  // Check for ELF executable (Linux)
  if (header[0] === 0x7F && header[1] === 0x45 && header[2] === 0x4C && header[3] === 0x46) {
    return { valid: false, reason: 'File content resembles an ELF executable binary' };
  }

  // Check for PDF signature: %PDF- (0x25, 0x50, 0x44, 0x46)
  if (ext === '.pdf') {
    const isPdf = header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46;
    if (!isPdf) {
      return { valid: false, reason: 'File does not have a valid PDF header (%PDF-)' };
    }
  }

  // Check for PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (ext === '.png') {
    const isPng = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47;
    if (!isPng) {
      return { valid: false, reason: 'File does not have a valid PNG header' };
    }
  }

  // Check for JPEG signature: FF D8 FF
  if (ext === '.jpg' || ext === '.jpeg') {
    const isJpeg = header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF;
    if (!isJpeg) {
      return { valid: false, reason: 'File does not have a valid JPEG header' };
    }
  }

  // Check for GIF signature: GIF87a or GIF89a
  if (ext === '.gif') {
    const isGif = header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x38;
    if (!isGif) {
      return { valid: false, reason: 'File does not have a valid GIF header' };
    }
  }

  // Check for modern Office OOXML (docx, xlsx, pptx) or ZIP: PK\x03\x04
  if (['.docx', '.xlsx', '.pptx', '.zip'].includes(ext)) {
    const isZip = header[0] === 0x50 && header[1] === 0x4B && header[2] === 0x03 && header[3] === 0x04;
    if (!isZip) {
      return { valid: false, reason: `File with extension ${ext} does not have a valid PK zip archive structure` };
    }
  }

  return { valid: true };
}

module.exports = {
  CATEGORY_MAP,
  BLOCKED_EXTENSIONS,
  getCategoryFromExtension,
  sanitizeFilename,
  isBlockedExtension,
  formatBytes,
  validateBufferSignature
};

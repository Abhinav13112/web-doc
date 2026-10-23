const path = require('path');
const { validateBufferSignature, formatBytes } = require('../utils/fileHelpers');
const { supabaseAdmin } = require('../config/supabase');

const userQuotaMB = parseInt(process.env.USER_STORAGE_QUOTA_MB || '500', 10);
const userQuotaBytes = userQuotaMB * 1024 * 1024;

/**
 * Middleware to validate file buffers, inspect magic numbers,
 * and verify that user will not exceed their account quota.
 */
async function validateUploadedFiles(req, res, next) {
  const files = req.files || (req.file ? [req.file] : []);

  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files provided for upload.'
    });
  }

  // 1. Validate magic bytes and signatures
  let totalIncomingSize = 0;
  for (const file of files) {
    totalIncomingSize += file.size;
    const ext = path.extname(file.originalname).toLowerCase();
    const sigCheck = validateBufferSignature(file.buffer, ext);
    if (!sigCheck.valid) {
      return res.status(400).json({
        success: false,
        message: `Security validation failed for file '${file.originalname}': ${sigCheck.reason}`
      });
    }
  }

  // 2. Storage quota validation for user
  try {
    const userId = req.user.id;
    const client = req.supabase || supabaseAdmin;

    // Query total current storage for this user
    const { data, error } = await client
      .from('documents')
      .select('file_size')
      .eq('user_id', userId)
      .eq('is_trashed', false);

    if (!error && data) {
      const currentUsedBytes = data.reduce((acc, row) => acc + (parseInt(row.file_size, 10) || 0), 0);
      if (currentUsedBytes + totalIncomingSize > userQuotaBytes) {
        return res.status(400).json({
          success: false,
          message: `Storage quota exceeded. Your current usage is ${formatBytes(currentUsedBytes)} of ${userQuotaMB} MB. Uploading these files (${formatBytes(totalIncomingSize)}) would exceed your limit.`
        });
      }
    }
  } catch (err) {
    console.warn('Quota check error (continuing):', err.message);
  }

  next();
}

module.exports = {
  validateUploadedFiles
};

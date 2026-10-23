const { supabaseAdmin } = require('../config/supabase');
const { formatBytes } = require('../utils/fileHelpers');

const userQuotaMB = parseInt(process.env.USER_STORAGE_QUOTA_MB || '500', 10);
const userQuotaBytes = userQuotaMB * 1024 * 1024;

/**
 * Get current authenticated user profile and storage quota status
 */
async function getProfile(req, res) {
  try {
    const user = req.user;
    const client = req.supabase || supabaseAdmin;

    // Calculate current storage usage
    const { data: docs, error } = await client
      .from('documents')
      .select('file_size')
      .eq('user_id', user.id)
      .eq('is_trashed', false);

    let usedBytes = 0;
    if (docs) {
      usedBytes = docs.reduce((acc, row) => acc + (parseInt(row.file_size, 10) || 0), 0);
    }

    const percentUsed = Math.min(100, parseFloat(((usedBytes / userQuotaBytes) * 100).toFixed(1)));

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
        metadata: user.user_metadata || {},
        storage: {
          usedBytes,
          formattedUsed: formatBytes(usedBytes),
          quotaBytes: userQuotaBytes,
          formattedQuota: formatBytes(userQuotaBytes),
          percentUsed,
          remainingBytes: Math.max(0, userQuotaBytes - usedBytes),
          formattedRemaining: formatBytes(Math.max(0, userQuotaBytes - usedBytes))
        }
      }
    });
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile.'
    });
  }
}

module.exports = {
  getProfile
};

const { supabaseAdmin, createUserScopedClient } = require('../config/supabase');

/**
 * Authentication Middleware
 * Validates Supabase JWT from Authorization header and attaches the user context to req.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing. Please provide a valid Bearer token.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format.'
      });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Supabase client is uninitialized.'
      });
    }

    // Validate the JWT against Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: error ? error.message : 'Invalid or expired session token.'
      });
    }

    // Attach user and scoped client to request
    req.user = user;
    req.token = token;
    req.supabase = createUserScopedClient(token);

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal authentication error.'
    });
  }
}

module.exports = {
  requireAuth
};

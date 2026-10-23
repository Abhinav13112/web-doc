const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

router.get('/', async (req, res) => {
  let supabaseStatus = 'disconnected';
  
  if (supabaseAdmin) {
    try {
      // Ping check
      const { error } = await supabaseAdmin.from('documents').select('id').limit(1);
      supabaseStatus = error ? `error: ${error.message}` : 'healthy';
    } catch (e) {
      supabaseStatus = `error: ${e.message}`;
    }
  }

  res.status(200).json({
    status: 'online',
    appName: 'DocuVault API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    supabase: supabaseStatus
  });
});

module.exports = router;

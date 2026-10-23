const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn('⚠️ WARNING: SUPABASE_URL is not set in environment variables. Database & Storage operations will fail.');
}

/**
 * Administrative Supabase Client (Service Role)
 * Used by backend for secure system operations, bucket administration,
 * and operations where server-side validation is enforced.
 */
const supabaseAdmin = (supabaseUrl && (supabaseServiceRoleKey || supabaseAnonKey))
  ? createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      realtime: {
        transport: WebSocket
      }
    })
  : null;

/**
 * Creates a scoped Supabase client with the authenticated user's JWT token.
 * This guarantees all queries execute strictly under the user's RLS policies.
 */
function createUserScopedClient(accessToken) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    realtime: {
      transport: WebSocket
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
}

module.exports = {
  supabaseAdmin,
  createUserScopedClient,
  supabaseUrl,
  supabaseAnonKey
};


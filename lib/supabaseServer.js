/*
DESCRIPTION: Server-side Supabase clients for different security levels.
- createAdminClient() - Uses service role key for privileged operations (user management, etc.)
- createServerClient() - Uses anon key for safe read operations (public data)
- Both clients run server-side and don't persist sessions

WHAT EACH PART DOES:
1. createAdminClient() - Full database access with service role key
2. createServerClient() - Limited access with anon key for public data
3. Environment variables - Secure configuration from .env.local
4. Session handling - Disabled since these run server-side

PSEUDOCODE:
- Import createClient from supabase-js
- Create admin client with SERVICE_ROLE_KEY for privileged operations
- Create server client with anon key for safe reads
- Export both clients for different use cases
*/

// Import Supabase client creation function
import { createClient } from "@supabase/supabase-js";

/**
 * Creates an admin client with full database access
 * Uses service role key for privileged operations like user management
 * 
 * @returns {Object} Supabase admin client
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { 
      auth: { 
        persistSession: false,
        autoRefreshToken: false
      } 
    }
  );
}

/**
 * Creates a server client with limited access
 * Uses anon key for safe read operations on public data
 * 
 * @returns {Object} Supabase server client
 */
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { 
      auth: { 
        persistSession: false,
        autoRefreshToken: false
      } 
    }
  );
}

// Legacy export for backward compatibility
// This uses admin client for existing code
export const supabaseServer = createAdminClient();



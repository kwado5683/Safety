/*
Description: Server-side Supabase client for privileged operations.
- Uses service role key (do not expose to browser).
- Disables session persistence since this runs server-side.

Pseudocode:
- Import createClient from supabase-js
- Initialize with URL and SERVICE_ROLE_KEY from env
- Export the configured client for server use
*/
import { createClient } from "@supabase/supabase-js";

export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);



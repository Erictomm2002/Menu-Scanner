import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Public/anon client - use for client-side operations and non-privileged reads
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client - use for server-side operations that bypass RLS
// Only use this in API routes or server components, never on the client
// Note: In production, set SUPABASE_SERVICE_ROLE_KEY (without NEXT_PUBLIC_) in environment variables
export const supabaseServiceRole = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

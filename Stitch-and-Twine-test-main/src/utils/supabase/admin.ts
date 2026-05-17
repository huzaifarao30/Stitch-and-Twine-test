/**
 * ⚠️  ADMIN-ONLY SUPABASE CLIENT
 * 
 * ⚠️  CRITICAL SECURITY WARNING ⚠️
 * 
 * THIS FILE USES SUPABASE_SERVICE_ROLE_KEY AND BYPASSES ROW LEVEL SECURITY (RLS).
 * 
 * ❌ NEVER IMPORT THIS INTO:
 *    - Client components (files with "use client")
 *    - Client-side code that runs in browsers
 *    - Public APIs or API routes accessible to users
 *    - Any code exposed to the frontend
 * 
 * ✅ SAFE TO USE IN:
 *    - Backend-only Server Actions ("use server")
 *    - Server Components (only if NOT re-exported to client)
 *    - Backend cron jobs or background tasks
 *    - Private admin utilities
 *    - API routes that require authentication AND authorization
 * 
 * If you import this incorrectly, your service role key will be exposed
 * to the browser, allowing anyone to bypass all security policies and RLS.
 * This is a CRITICAL SECURITY VULNERABILITY.
 * 
 * Usage (Server Action only):
 *   "use server";
 *   import { createAdminClient } from "@/utils/supabase/admin";
 *   
 *   export async function adminOnlyAction() {
 *     const supabase = createAdminClient();
 *     if (!supabase) throw new Error("Admin client not configured");
 *     // This bypasses RLS - use with extreme caution
 *     const { data } = await supabase.from("users").select("*");
 *     return data;
 *   }
 */

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

/**
 * Creates an admin-privileged Supabase client that bypasses RLS.
 * 
 * ⚠️  ONLY USE THIS IN SERVER-ONLY CONTEXTS (Server Actions, Server Components)
 * ⚠️  NEVER EXPORT OR PASS THIS TO CLIENT-SIDE CODE
 * 
 * @returns Admin Supabase client or null if service role key is missing
 */
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error(
      "⚠️  Admin Supabase client not configured. Check your environment for:\n" +
      "  NEXT_PUBLIC_SUPABASE_URL\n" +
      "  SUPABASE_SERVICE_ROLE_KEY\n\n" +
      "IMPORTANT: SUPABASE_SERVICE_ROLE_KEY must NEVER be in .env.local or public files.\n" +
      "It should only exist on your server (.env or deployment platform secrets)."
    );
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}

/**
 * Get the singleton admin client instance.
 * Returns null if service role key is not configured.
 */
export function getAdminClient(): SupabaseClient | null {
  return createAdminClient();
}

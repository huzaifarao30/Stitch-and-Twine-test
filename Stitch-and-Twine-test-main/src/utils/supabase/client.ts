/**
 * Client-side Supabase client
 * 
 * Use this in Client Components and client-side operations.
 * This client uses the browser's sessionStorage for auth persistence.
 * 
 * Usage:
 *   import { createClient } from "@/utils/supabase/client";
 *   
 *   export default function Component() {
 *     const supabase = createClient();
 *     // Use supabase.auth, supabase.from(), etc.
 *   }
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function createClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn(
      "Supabase environment variables missing. Check your .env.local for:\n" +
      "  NEXT_PUBLIC_SUPABASE_URL\n" +
      "  NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    return null;
  }

  if (!client) {
    client = createBrowserClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return client;
}

/**
 * Get or create a singleton Supabase client instance.
 * Useful for quick access in client components.
 */
export function getClient(): SupabaseClient | null {
  return createClient();
}

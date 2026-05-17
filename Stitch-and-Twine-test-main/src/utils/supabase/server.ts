/**
 * Server-side Supabase client
 * 
 * Use this in Server Components and Server Actions.
 * Automatically handles auth session via httpOnly cookies.
 * This enables seamless auth state persistence across page reloads.
 * 
 * Usage in Server Component:
 *   import { createClient } from "@/utils/supabase/server";
 *   
 *   export default async function Page() {
 *     const supabase = await createClient();
 *     const { data: { user } } = await supabase.auth.getUser();
 *     return <div>{user?.email}</div>;
 *   }
 * 
 * Usage in Server Action:
 *   "use server";
 *   import { createClient } from "@/utils/supabase/server";
 *   
 *   export async function getUserEmail() {
 *     const supabase = await createClient();
 *     const { data: { user } } = await supabase.auth.getUser();
 *     return user?.email;
 *   }
 */

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function createClient(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error(
      "Supabase environment variables missing. Check your .env.local for:\n" +
      "  NEXT_PUBLIC_SUPABASE_URL\n" +
      "  NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Cookie operations in Server Actions may fail if cookies have
          // already been sent to the client (common in streaming responses).
          // This is safe to ignore in most contexts.
        }
      },
    },
  });
}

/**
 * Server-side Supabase client (for Server Components & Route Handlers).
 * Usage:  const supabase = await createServerSupabase();
 *
 * NOTE: Requires Next.js cookies() API – only works inside Server
 * Components, Route Handlers, and Server Actions.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
            // setAll can throw in Server Components — safe to ignore
          }
        },
      },
    }
  );
}

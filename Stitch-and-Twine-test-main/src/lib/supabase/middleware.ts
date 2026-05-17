import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const normalizeRole = (role: unknown) =>
  typeof role === "string" ? role.trim().toLowerCase() : null;

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLoginRoute = pathname === "/admin/login";

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    if (isAdminRoute && !isAdminLoginRoute) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminRoute) {
    return response;
  }

  if (!user) {
    if (isAdminLoginRoute) {
      return response;
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const metadataRole =
    typeof user.app_metadata?.role === "string"
      ? user.app_metadata.role
      : typeof user.user_metadata?.role === "string"
      ? user.user_metadata.role
      : null;

  let isAdmin = normalizeRole(metadataRole) === "admin";

  if (!isAdmin) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    isAdmin = normalizeRole(profile?.role) === "admin";
  }

  if (!isAdmin) {
    if (!isAdminLoginRoute) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  if (isAdminLoginRoute) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

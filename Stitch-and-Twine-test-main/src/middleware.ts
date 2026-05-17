import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Try to use the Supabase middleware if it exists
  try {
    return await updateSession(request);
  } catch {
    // FIX 1: Only redirect if they are in /admin BUT NOT already on the login page
    if (
      request.nextUrl.pathname.startsWith("/admin") &&
      !request.nextUrl.pathname.startsWith("/admin/login")
    ) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - admin/login (DON'T block the login page)
     * - api/auth (DON'T block Supabase background auth routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|admin/login|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
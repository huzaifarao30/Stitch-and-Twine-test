"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import {
  ADMIN_ABSOLUTE_TIMEOUT_MS,
  USER_ABSOLUTE_TIMEOUT_MS,
} from "@/lib/sessionPolicy";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  adminUser: AuthUser | null;
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const SESSION_START_KEY = "st_session_started_at_ms";

function clearSessionStartMs() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_START_KEY);
}

function readSessionStartMs() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_START_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    window.localStorage.removeItem(SESSION_START_KEY);
    return null;
  }
  return parsed;
}

function resolveSessionStartMs(lastSignInAt?: string | null) {
  const fromStorage = readSessionStartMs();
  if (fromStorage) {
    return fromStorage;
  }

  let baseline = Date.now();
  if (lastSignInAt) {
    const parsedSignIn = Date.parse(lastSignInAt);
    if (Number.isFinite(parsedSignIn)) {
      baseline = parsedSignIn;
    }
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(SESSION_START_KEY, String(baseline));
  }

  return baseline;
}

function hasAbsoluteSessionExpired(startedAtMs: number, maxAgeMs: number) {
  return Date.now() - startedAtMs >= maxAgeMs;
}

function toAuthUser(user: User): AuthUser {
  const fullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
  const fallbackName = user.email?.split("@")[0] || "User";
  const phone = typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : null;
  const metadataRole =
    typeof user.app_metadata?.role === "string"
      ? user.app_metadata.role
      : typeof user.user_metadata?.role === "string"
      ? user.user_metadata.role
      : null;

  return {
    id: user.id,
    email: user.email || "",
    name: fullName.trim() || fallbackName,
    phone,
    role: metadataRole,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdminRole = useCallback(
    (role: string | null | undefined) => role?.trim().toLowerCase() === "admin",
    []
  );

  const checkAdminRoleFromServer = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/role", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) return false;
      const json = (await res.json()) as { isAdmin?: boolean };
      return json.isAdmin === true;
    } catch {
      return false;
    }
  }, []);

  const applyRoleAwareUser = useCallback(
    async (mappedUser: AuthUser | null, sourceUser: User | null) => {
      if (!mappedUser) {
        clearSessionStartMs();
        setSession(null);
        setUser(null);
        setAdminUser(null);
        return;
      }

      const fromMetadata = isAdminRole(mappedUser.role);
      const fromServer = fromMetadata ? true : await checkAdminRoleFromServer();
      const isAdmin = fromMetadata || fromServer;
      const sessionStartedAt = resolveSessionStartMs(sourceUser?.last_sign_in_at ?? null);
      const absoluteTimeoutMs = isAdmin ? ADMIN_ABSOLUTE_TIMEOUT_MS : USER_ABSOLUTE_TIMEOUT_MS;

      if (hasAbsoluteSessionExpired(sessionStartedAt, absoluteTimeoutMs)) {
        const supabase = createClient();
        if (supabase) {
          await supabase.auth.signOut();
        }
        clearSessionStartMs();
        setSession(null);
        setUser(null);
        setAdminUser(null);
        return;
      }

      setUser(isAdmin ? null : mappedUser);
      setAdminUser(isAdmin ? mappedUser : null);
    },
    [checkAdminRoleFromServer, isAdminRole]
  );

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setSession(null);
      setUser(null);
      setAdminUser(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    const initializeSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      const mappedUser = currentSession?.user ? toAuthUser(currentSession.user) : null;
      setSession(currentSession);
      await applyRoleAwareUser(mappedUser, currentSession?.user ?? null);
      setLoading(false);
    };

    void initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "SIGNED_IN") {
        clearSessionStartMs();
      }

      const mappedUser = nextSession?.user ? toAuthUser(nextSession.user) : null;
      setSession(nextSession);
      void applyRoleAwareUser(mappedUser, nextSession?.user ?? null).finally(() => {
        setLoading(false);
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applyRoleAwareUser]);

  const value = useMemo(
    () => ({
      user,
      adminUser,
      session,
      loading,
    }),
    [adminUser, loading, session, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

"use client";

import { useEffect, useRef } from "react";
import { emitContentUpdated, type ContentUpdateKind } from "@/lib/clientRefreshBus";
import { createClient } from "@/utils/supabase/client";

const DEBOUNCE_MS = 500;

export default function RealtimeContentBridge() {
  const pendingKindsRef = useRef<Set<ContentUpdateKind>>(new Set());
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const flushPending = () => {
      if (pendingKindsRef.current.size === 0) return;

      if (pendingKindsRef.current.size > 1 || pendingKindsRef.current.has("all")) {
        emitContentUpdated("all");
      } else {
        const kind = pendingKindsRef.current.values().next().value;
        if (kind) {
          emitContentUpdated(kind);
        }
      }

      pendingKindsRef.current.clear();
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };

    const queueUpdate = (kind: ContentUpdateKind) => {
      pendingKindsRef.current.add(kind);

      if (document.visibilityState !== "visible") {
        return;
      }

      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = window.setTimeout(() => {
        flushPending();
      }, DEBOUNCE_MS);
    };

    const channel = supabase
      .channel("content-updates-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => queueUpdate("products")
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        () => queueUpdate("categories")
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "banners" },
        () => queueUpdate("banners")
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings" },
        () => queueUpdate("settings")
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => queueUpdate("all")
      )
      .subscribe();

    const onVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        flushPending();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityOrFocus);
    window.addEventListener("focus", onVisibilityOrFocus);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityOrFocus);
      window.removeEventListener("focus", onVisibilityOrFocus);
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
      pendingKindsRef.current.clear();
      void supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
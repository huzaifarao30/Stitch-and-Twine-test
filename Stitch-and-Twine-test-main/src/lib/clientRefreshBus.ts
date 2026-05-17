"use client";

export type ContentUpdateKind =
  | "settings"
  | "categories"
  | "products"
  | "banners"
  | "sales"
  | "all";

const STORAGE_KEY = "stitch_and_twine_content_updated";
const LOCAL_EVENT = "stitch-and-twine-content-updated";

export function emitContentUpdated(kind: ContentUpdateKind = "all") {
  if (typeof window === "undefined") {
    return;
  }

  const payload = JSON.stringify({ kind, at: Date.now() });

  try {
    window.localStorage.setItem(STORAGE_KEY, payload);
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }

  window.dispatchEvent(new CustomEvent(LOCAL_EVENT, { detail: { kind } }));
}

export function subscribeContentUpdated(listener: (kind: ContentUpdateKind) => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) {
      return;
    }

    try {
      const parsed = JSON.parse(event.newValue) as { kind?: ContentUpdateKind };
      listener(parsed.kind ?? "all");
    } catch {
      listener("all");
    }
  };

  const onLocalEvent = (event: Event) => {
    const customEvent = event as CustomEvent<{ kind?: ContentUpdateKind }>;
    listener(customEvent.detail?.kind ?? "all");
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(LOCAL_EVENT, onLocalEvent as EventListener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LOCAL_EVENT, onLocalEvent as EventListener);
  };
}

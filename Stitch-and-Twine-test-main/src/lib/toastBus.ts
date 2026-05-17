export type ToastTone = "success" | "info" | "error";

export interface ToastEvent {
  id: string;
  message: string;
  tone: ToastTone;
}

const TOAST_EVENT = "stw:toast";

export function showToast(message: string, tone: ToastTone = "success") {
  if (typeof window === "undefined") return;
  const event = new CustomEvent<ToastEvent>(TOAST_EVENT, {
    detail: {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      message,
      tone,
    },
  });
  window.dispatchEvent(event);
}

export function subscribeToast(listener: (event: ToastEvent) => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = (evt: Event) => {
    const customEvt = evt as CustomEvent<ToastEvent>;
    if (!customEvt.detail?.id) return;
    listener(customEvt.detail);
  };

  window.addEventListener(TOAST_EVENT, handler as EventListener);
  return () => window.removeEventListener(TOAST_EVENT, handler as EventListener);
}

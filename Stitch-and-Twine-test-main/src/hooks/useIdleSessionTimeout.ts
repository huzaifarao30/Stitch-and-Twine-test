"use client";

import { useCallback, useEffect, useRef } from "react";

type IdleTimeoutOptions = {
  enabled: boolean;
  idleTimeoutMs: number;
  warningTimeoutMs?: number;
  onWarning?: () => void;
  onTimeout: () => void | Promise<void>;
};

const DEFAULT_EVENTS: Array<keyof WindowEventMap> = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

export function useIdleSessionTimeout(options: IdleTimeoutOptions) {
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningShownRef = useRef(false);
  const timeoutTriggeredRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();

    warningShownRef.current = false;
    timeoutTriggeredRef.current = false;

    const warningMs = Math.max(0, options.warningTimeoutMs ?? 0);

    if (warningMs > 0 && warningMs < options.idleTimeoutMs) {
      warningTimerRef.current = setTimeout(() => {
        if (warningShownRef.current || timeoutTriggeredRef.current) {
          return;
        }
        warningShownRef.current = true;
        options.onWarning?.();
      }, options.idleTimeoutMs - warningMs);
    }

    timeoutTimerRef.current = setTimeout(() => {
      if (timeoutTriggeredRef.current) {
        return;
      }
      timeoutTriggeredRef.current = true;
      void options.onTimeout();
    }, options.idleTimeoutMs);
  }, [clearTimers, options]);

  const resetIdleTimer = useCallback(() => {
    if (!options.enabled) {
      return;
    }
    startTimers();
  }, [options.enabled, startTimers]);

  useEffect(() => {
    if (!options.enabled) {
      clearTimers();
      warningShownRef.current = false;
      timeoutTriggeredRef.current = false;
      return;
    }

    const onActivity = () => {
      if (timeoutTriggeredRef.current) {
        return;
      }
      startTimers();
    };

    startTimers();

    DEFAULT_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, onActivity, { passive: true });
    });

    return () => {
      DEFAULT_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, onActivity);
      });
      clearTimers();
    };
  }, [clearTimers, options.enabled, startTimers]);

  return { resetIdleTimer };
}

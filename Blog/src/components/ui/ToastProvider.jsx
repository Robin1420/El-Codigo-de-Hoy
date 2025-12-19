import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);
const DEFAULT_DURATION = 2800;

const VARIANT_STYLES = {
  success: "border-[rgba(34,197,94,0.35)] text-[rgba(34,197,94,0.95)]",
  error: "border-[rgba(248,113,113,0.35)] text-[rgba(248,113,113,0.95)]",
  info: "border-[rgba(148,163,184,0.35)] text-[var(--text-color)]",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addToast = useCallback(
    (message, variant = "info", options = {}) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const duration = options.duration ?? DEFAULT_DURATION;
      const next = { id, message, variant, duration };
      setToasts((prev) => [...prev, next]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  const api = useMemo(
    () => ({
      show: (message, variant = "info", options) => addToast(message, variant, options),
      success: (message, options) => addToast(message, "success", options),
      error: (message, options) => addToast(message, "error", options),
      info: (message, options) => addToast(message, "info", options),
    }),
    [addToast],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="fixed top-5 right-5 z-[60] space-y-2 pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              "pointer-events-auto",
              "theme-surface bg-[var(--panel-color)]",
              "rounded-xl border shadow-lg",
              "px-4 py-3 text-sm font-semibold",
              "transition-[transform,opacity] duration-200 ease",
              VARIANT_STYLES[toast.variant] || VARIANT_STYLES.info,
            ].join(" ")}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast debe usarse dentro de ToastProvider.");
  }
  return ctx;
}


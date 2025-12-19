import { useEffect, useRef } from "react";

export function Modal({ open, title, onClose, children, maxWidthClassName = "max-w-xl" }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => panelRef.current?.focus(), 0);
    return () => clearTimeout(id);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={[
            "w-full",
            maxWidthClassName,
            "outline-none",
            "theme-surface bg-[var(--panel-color)] border border-[var(--border-color)]",
            "rounded-2xl shadow-xl",
            "max-h-[calc(100vh-32px)] overflow-hidden flex flex-col",
            "transition-[background-color,color,border-color] duration-200 ease",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-3 px-4 h-12 border-b border-[var(--border-color)]">
            <div className="min-w-0">
              <h3 className="text-base font-semibold truncate">{title}</h3>
            </div>
            <button
              type="button"
              aria-label="Cerrar"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border-color)] hover:border-[var(--color-500)] transition-colors"
              onClick={onClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

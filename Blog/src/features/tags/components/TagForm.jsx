import { useEffect, useMemo, useState } from "react";
import { slugify } from "../../../lib/slugify";

export function TagForm({
  mode,
  initialValues,
  onSubmit,
  submitting,
  submitLabel,
  error,
  onCancel,
  variant = "card",
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [autoSlug, setAutoSlug] = useState(mode === "create");

  useEffect(() => {
    setName(initialValues?.name ?? "");
    setSlug(initialValues?.slug ?? "");
  }, [initialValues]);

  useEffect(() => {
    if (!autoSlug) return;
    setSlug(slugify(name));
  }, [name, autoSlug]);

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  const formClassName =
    variant === "modal"
      ? "flex flex-col gap-4"
      : "theme-surface bg-[var(--panel-color)] rounded-2xl p-4 shadow-sm";

  const actionsClassName =
    variant === "modal"
      ? [
          "sticky bottom-0",
          "-mx-4 px-4 pt-3 pb-4",
          "bg-[var(--panel-color)]",
          "border-t border-[var(--border-color)]",
          "flex items-center justify-end gap-2",
        ].join(" ")
      : "flex items-center justify-end gap-2";

  return (
    <form
      className={formClassName}
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit || submitting) return;
        onSubmit({
          name: name.trim(),
          slug: slug.trim() || slugify(name),
        });
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: React"
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-[var(--subtle-text)]">Slug</label>
            <label className="inline-flex items-center gap-2 text-xs text-[var(--subtle-text)] select-none">
              <input
                type="checkbox"
                className="accent-[var(--color-500)]"
                checked={autoSlug}
                onChange={(e) => setAutoSlug(e.target.checked)}
              />
              Auto
            </label>
          </div>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="react"
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          />
          <p className="text-xs text-[var(--subtle-text)]">
            Debe ser único. Se usa para filtros y búsquedas.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] px-4 py-3">
          <p className="text-sm font-semibold text-[rgba(248,113,113,0.95)]">{error}</p>
        </div>
      ) : null}

      <div className={actionsClassName}>
        {onCancel ? (
          <button
            type="button"
            className="h-11 px-4 rounded-xl border border-[var(--border-color)] font-semibold hover:border-[var(--color-500)] transition-colors"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancelar
          </button>
        ) : null}
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className={[
            "h-11 px-4 rounded-xl font-semibold transition-colors shadow-sm",
            "border border-[var(--color-500)]",
            !canSubmit || submitting
              ? "opacity-60 cursor-not-allowed bg-[var(--color-500)] text-white"
              : "bg-[var(--color-500)] text-white hover:bg-[var(--color-600)]",
          ].join(" ")}
        >
          {submitting ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}


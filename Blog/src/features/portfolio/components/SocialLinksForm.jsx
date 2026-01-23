import { useEffect, useMemo, useState } from "react";

export function SocialLinksForm({
  mode,
  initialValues,
  onSubmit,
  submitting,
  submitLabel,
  error,
  onCancel,
  variant = "card",
}) {
  const [platformName, setPlatformName] = useState(initialValues?.platform_name ?? "");
  const [url, setUrl] = useState(initialValues?.url ?? "");
  const [icon, setIcon] = useState(initialValues?.icon ?? "");
  const [position, setPosition] = useState(initialValues?.position ?? 1);

  useEffect(() => {
    setPlatformName(initialValues?.platform_name ?? "");
    setUrl(initialValues?.url ?? "");
    setIcon(initialValues?.icon ?? "");
    setPosition(initialValues?.position ?? 1);
  }, [initialValues]);

  const canSubmit = useMemo(() => platformName.trim().length > 0 && url.trim().length > 0, [platformName, url]);

  const formClassName =
    variant === "modal"
      ? "flex flex-col gap-4"
      : "theme-surface bg-[var(--panel-color)] rounded-2xl p-4 shadow-sm flex flex-col gap-4";

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
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit || submitting) return;
        onSubmit({
          platform_name: platformName.trim(),
          url: url.trim(),
          icon: icon.trim() || null,
          position: Number.isFinite(Number(position)) ? Number(position) : 1,
        });
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">Plataforma</label>
          <input
            value={platformName}
            onChange={(event) => setPlatformName(event.target.value)}
            placeholder="Ej: GitHub"
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">URL</label>
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://..."
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">Icono</label>
          <input
            value={icon}
            onChange={(event) => setIcon(event.target.value)}
            placeholder="github / linkedin"
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">{"Posici\u00f3n"}</label>
          <input
            type="number"
            min={1}
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          />
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
          {submitting ? "Guardando..." : submitLabel ?? (mode === "edit" ? "Actualizar" : "Crear")}
        </button>
      </div>
    </form>
  );
}

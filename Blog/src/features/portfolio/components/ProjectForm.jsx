import { useEffect, useMemo, useState } from "react";

function joinTechStack(value) {
  if (!Array.isArray(value)) return "";
  return value.join(", ");
}

function parseTechStack(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ProjectForm({
  mode,
  initialValues,
  onSubmit,
  submitting,
  submitLabel,
  error,
  onCancel,
  variant = "card",
}) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [techStackInput, setTechStackInput] = useState(joinTechStack(initialValues?.tech_stack));
  const [repoUrl, setRepoUrl] = useState(initialValues?.repo_url ?? "");
  const [demoUrl, setDemoUrl] = useState(initialValues?.demo_url ?? "");
  const [imageUrl, setImageUrl] = useState(initialValues?.image_url ?? "");
  const [position, setPosition] = useState(initialValues?.position ?? 1);

  useEffect(() => {
    setTitle(initialValues?.title ?? "");
    setDescription(initialValues?.description ?? "");
    setTechStackInput(joinTechStack(initialValues?.tech_stack));
    setRepoUrl(initialValues?.repo_url ?? "");
    setDemoUrl(initialValues?.demo_url ?? "");
    setImageUrl(initialValues?.image_url ?? "");
    setPosition(initialValues?.position ?? 1);
  }, [initialValues]);

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

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
          title: title.trim(),
          description: description.trim() || null,
          tech_stack: techStackInput.trim() ? parseTechStack(techStackInput) : null,
          repo_url: repoUrl.trim() || null,
          demo_url: demoUrl.trim() || null,
          image_url: imageUrl.trim() || null,
          position: Number.isFinite(Number(position)) ? Number(position) : 1,
        });
      }}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2 lg:col-span-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">{"T\u00edtulo"}</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej: Sistema de publicaciones automatizadas"
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2 lg:col-span-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">{"Descripci\u00f3n"}</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Describe el proyecto y su aporte principal."
            className="rounded-xl border border-[var(--border-color)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-500)] transition-colors resize-y"
          />
        </div>

        <div className="flex flex-col gap-2 lg:col-span-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">{"Tecnolog\u00edas"}</label>
          <input
            value={techStackInput}
            onChange={(event) => setTechStackInput(event.target.value)}
            placeholder="React, Supabase, Tailwind, n8n"
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          />
          <p className="text-xs text-[var(--subtle-text)]">Separa con comas para generar el stack del proyecto.</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">Repositorio</label>
          <input
            value={repoUrl}
            onChange={(event) => setRepoUrl(event.target.value)}
            placeholder="https://github.com/usuario/proyecto"
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">Demo</label>
          <input
            value={demoUrl}
            onChange={(event) => setDemoUrl(event.target.value)}
            placeholder="https://demo.proyecto.com"
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2 lg:col-span-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">Imagen</label>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[200px,1fr]">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)] overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt="Preview del proyecto" className="h-[120px] w-full object-cover" />
              ) : (
                <div className="h-[120px] flex items-center justify-center text-xs text-[var(--subtle-text)]">
                  Sin imagen
                </div>
              )}
            </div>
            <input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://..."
              className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
            />
          </div>
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

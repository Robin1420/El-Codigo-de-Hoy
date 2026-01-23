import { useEffect, useMemo, useState } from "react";

function getDescriptionText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value.body || value.text || "";
  return "";
}

export function ExperienceForm({
  mode,
  initialValues,
  onSubmit,
  submitting,
  submitLabel,
  error,
  onCancel,
  variant = "card",
}) {
  const [positionTitle, setPositionTitle] = useState(initialValues?.position_title ?? "");
  const [company, setCompany] = useState(initialValues?.company ?? "");
  const [companyLogo, setCompanyLogo] = useState(initialValues?.company_logo_url ?? "");
  const [startDate, setStartDate] = useState(initialValues?.start_date ?? "");
  const [endDate, setEndDate] = useState(initialValues?.end_date ?? "");
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [current, setCurrent] = useState(Boolean(initialValues?.current));
  const [description, setDescription] = useState(getDescriptionText(initialValues?.description));

  useEffect(() => {
    setPositionTitle(initialValues?.position_title ?? "");
    setCompany(initialValues?.company ?? "");
    setCompanyLogo(initialValues?.company_logo_url ?? "");
    setStartDate(initialValues?.start_date ?? "");
    setEndDate(initialValues?.end_date ?? "");
    setLocation(initialValues?.location ?? "");
    setCurrent(Boolean(initialValues?.current));
    setDescription(getDescriptionText(initialValues?.description));
  }, [initialValues]);

  useEffect(() => {
    if (current) setEndDate("");
  }, [current]);

  const canSubmit = useMemo(
    () => positionTitle.trim().length > 0 && company.trim().length > 0,
    [positionTitle, company],
  );

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
          position_title: positionTitle.trim(),
          company: company.trim(),
          company_logo_url: companyLogo.trim() || null,
          start_date: startDate || null,
          end_date: current ? null : endDate || null,
          location: location.trim() || null,
          current: Boolean(current),
          description: description.trim() ? { type: "text", body: description.trim() } : null,
        });
      }}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">Cargo</label>
          <input
            value={positionTitle}
            onChange={(event) => setPositionTitle(event.target.value)}
            placeholder="Ej: Desarrollador Frontend"
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">Empresa</label>
          <input
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            placeholder="Ej: El Codigo de Hoy"
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2 lg:col-span-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">Logo de empresa</label>
          <input
            value={companyLogo}
            onChange={(event) => setCompanyLogo(event.target.value)}
            placeholder="https://..."
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">{"Fecha de inicio"}</label>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-[var(--subtle-text)]">{"Fecha de fin"}</label>
            <label className="inline-flex items-center gap-2 text-xs text-[var(--subtle-text)] select-none">
              <input
                type="checkbox"
                className="accent-[var(--color-500)]"
                checked={current}
                onChange={(event) => setCurrent(event.target.checked)}
              />
              Actual
            </label>
          </div>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            disabled={current}
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col gap-2 lg:col-span-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">Ubicacion</label>
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Ej: Remoto / Lima"
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2 lg:col-span-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">{"Descripci\u00f3n"}</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Describe el impacto y las responsabilidades principales."
            className="rounded-xl border border-[var(--border-color)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-500)] transition-colors resize-y"
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

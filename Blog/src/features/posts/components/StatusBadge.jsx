export function StatusBadge({ status }) {
  const normalized = String(status ?? "").toLowerCase();
  const label =
    normalized === "published"
      ? "Publicado"
      : normalized === "draft"
        ? "Borrador"
        : normalized === "pending"
          ? "Pendiente"
          : normalized === "rejected"
            ? "Rechazado"
        : normalized || "—";

  const className =
    normalized === "published"
      ? "bg-[rgba(34,197,94,0.15)] text-[rgba(34,197,94,0.95)] border-[rgba(34,197,94,0.35)]"
      : normalized === "draft"
        ? "bg-[rgba(248,113,113,0.12)] text-[rgba(248,113,113,0.95)] border-[rgba(248,113,113,0.35)]"
        : normalized === "pending"
          ? "bg-[rgba(245,158,11,0.16)] text-[rgba(245,158,11,0.95)] border-[rgba(245,158,11,0.35)]"
          : normalized === "rejected"
            ? "bg-[rgba(239,68,68,0.12)] text-[rgba(239,68,68,0.95)] border-[rgba(239,68,68,0.35)]"
        : "bg-[rgba(255,255,255,0.06)] text-[var(--subtle-text)] border-[var(--border-color)]";

  return (
    <span className={`inline-flex items-center px-2.5 h-7 rounded-full text-xs font-semibold border ${className}`}>
      {label}
    </span>
  );
}

export function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil((total ?? 0) / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);

  const canPrev = current > 1;
  const canNext = current < totalPages;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--subtle-text)]">
        Página {current} de {totalPages} · {total ?? 0} resultados
      </p>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2 sm:w-auto">
        <button
          type="button"
          disabled={!canPrev}
          className={[
            "h-11 w-full sm:w-auto px-3 rounded-xl border border-[var(--border-color)] font-semibold transition-colors",
            canPrev ? "hover:border-[var(--color-500)]" : "opacity-50 cursor-not-allowed",
          ].join(" ")}
          onClick={() => onPageChange(current - 1)}
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={!canNext}
          className={[
            "h-11 w-full sm:w-auto px-3 rounded-xl border border-[var(--border-color)] font-semibold transition-colors",
            canNext ? "hover:border-[var(--color-500)]" : "opacity-50 cursor-not-allowed",
          ].join(" ")}
          onClick={() => onPageChange(current + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}


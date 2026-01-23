import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { deleteExperience, listExperience } from "../services/experienceService";
import { Pagination } from "../../../components/ui/Pagination";
import { useToast } from "../../../components/ui/ToastProvider";

const PAGE_SIZE = 8;
const DESKTOP_GRID_STYLE = {
  gridTemplateColumns: "minmax(0, 2.2fr) minmax(0, 1.4fr) minmax(0, 1.2fr) minmax(0, 1fr) 190px",
};

function summarize(text, limit = 120) {
  const value = String(text || "");
  if (value.length <= limit) return value;
  return `${value.slice(0, limit)}...`;
}

function getDescriptionText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value.body || value.text || "";
  return "";
}

function formatRange(start, end, current) {
  if (current) return `${start || "Inicio"} - Actual`;
  if (!start && !end) return "Sin fechas";
  return `${start || "Inicio"} - ${end || "Fin"}`;
}

export function ExperienceList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const page = Number(searchParams.get("page") ?? "1") || 1;
  const q = searchParams.get("q") ?? "";

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const toast = useToast();

  const queryKey = useMemo(() => `${page}|${q}|${location.pathname}`, [page, q, location.pathname]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    listExperience({ page, pageSize: PAGE_SIZE, query: q })
      .then(({ data, count }) => {
        if (cancelled) return;
        setRows(data);
        setTotal(count);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "No se pudo cargar la experiencia.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [queryKey]);

  const setParam = (next) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      Object.entries(next).forEach(([k, v]) => {
        if (v === null || v === undefined || v === "") p.delete(k);
        else p.set(k, String(v));
      });
      return p;
    });
  };

  const refresh = async () => {
    const { data, count } = await listExperience({ page, pageSize: PAGE_SIZE, query: q });
    setRows(data);
    setTotal(count);
  };

  const handleDelete = async (experienceId, title) => {
    const ok = window.confirm(`?Eliminar "${title || "experiencia"}"? Esta accion no se puede deshacer.`);
    if (!ok) return;
    try {
      await deleteExperience(experienceId);
      await refresh();
      toast.success("Experiencia eliminada.");
    } catch (err) {
      setError(err?.message || "No se pudo eliminar la experiencia.");
      toast.error(err?.message || "No se pudo eliminar la experiencia.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="theme-surface bg-[var(--panel-color)] rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr,220px] sm:items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--subtle-text)]">Buscar</label>
            <input
              value={q}
              onChange={(event) => setParam({ q: event.target.value, page: 1 })}
              placeholder="Cargo o empresa..."
              className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
            />
          </div>
        </div>
      </section>

      {error ? (
        <section className="theme-surface bg-[var(--panel-color)] rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-[rgba(248,113,113,0.95)] font-semibold">{error}</p>
        </section>
      ) : null}

      <section className="theme-surface bg-[var(--panel-color)] rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden md:block p-4">
          <div className="overflow-x-auto">
            <table className="min-w-[960px] w-full border-separate border-spacing-y-3">
              <thead>
                <tr>
                  <th className="px-0 pb-2" colSpan={5}>
                    <div
                      className="grid gap-3 px-4 text-left text-sm text-[var(--subtle-text)] font-semibold"
                      style={DESKTOP_GRID_STYLE}
                    >
                      <div className="min-w-0">Experiencia</div>
                      <div className="min-w-0">Empresa</div>
                      <div className="min-w-0">Periodo</div>
                      <div className="min-w-0">Ubicacion</div>
                      <div className="min-w-0 text-right">Acciones</div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-3 py-6 text-sm text-[var(--subtle-text)]" colSpan={5}>
                      Cargando...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-sm text-[var(--subtle-text)]" colSpan={5}>
                      No hay experiencia aun. Crea el primer registro con "Nueva experiencia".
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-0 py-1.5" colSpan={5}>
                        <div className="rounded-2xl px-4 py-3 shadow-sm bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)]">
                          <div className="grid gap-3 items-center" style={DESKTOP_GRID_STYLE}>
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{row.position_title ?? "Sin titulo"}</p>
                              <p className="text-xs text-[var(--subtle-text)] truncate">
                                {summarize(getDescriptionText(row.description) || "Sin descripcion")}
                              </p>
                            </div>
                            <div className="min-w-0 text-sm text-[var(--subtle-text)] truncate">
                              {row.company ?? "Sin empresa"}
                            </div>
                            <div className="min-w-0 text-sm text-[var(--subtle-text)]">
                              {formatRange(row.start_date, row.end_date, row.current)}
                            </div>
                            <div className="min-w-0 text-sm text-[var(--subtle-text)] truncate">
                              {row.location || "-"}
                            </div>
                            <div className="min-w-0 flex items-center justify-end gap-2">
                              <Link
                                to={`/dashboard/portfolio/experience/${row.id}/edit`}
                                className="h-10 px-3 rounded-xl border border-[var(--border-color)] font-semibold hover:border-[var(--color-500)] transition-colors inline-flex items-center justify-center leading-none"
                              >
                                Editar
                              </Link>
                              <button
                                type="button"
                                className="h-10 px-3 rounded-xl border border-[rgba(248,113,113,0.35)] text-[rgba(248,113,113,0.95)] font-semibold hover:bg-[rgba(248,113,113,0.10)] transition-colors"
                                onClick={() => handleDelete(row.id, row.position_title)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:hidden p-4">
          {loading ? (
            <div className="text-sm text-[var(--subtle-text)]">Cargando...</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-[var(--subtle-text)]">No hay experiencia aun.</div>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-2xl p-4 shadow-sm bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.03)]"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold">{row.position_title ?? "Sin titulo"}</p>
                    <p className="text-xs text-[var(--subtle-text)]">{row.company ?? "Sin empresa"}</p>
                    <p className="text-xs text-[var(--subtle-text)]">
                      {formatRange(row.start_date, row.end_date, row.current)}
                    </p>
                    <p className="text-xs text-[var(--subtle-text)]">{row.location || "-"}</p>
                  </div>
                  <p className="mt-2 text-xs text-[var(--subtle-text)]">
                    {summarize(getDescriptionText(row.description) || "Sin descripcion")}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      to={`/dashboard/portfolio/experience/${row.id}/edit`}
                      className="h-10 rounded-xl border border-[var(--border-color)] font-semibold hover:border-[var(--color-500)] transition-colors flex items-center justify-center"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="h-10 rounded-xl border border-[rgba(248,113,113,0.35)] text-[rgba(248,113,113,0.95)] font-semibold hover:bg-[rgba(248,113,113,0.10)] transition-colors"
                      onClick={() => handleDelete(row.id, row.position_title)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="theme-surface bg-[var(--panel-color)] rounded-2xl shadow-sm p-4">
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={(next) => setParam({ page: next })} />
      </section>
    </div>
  );
}

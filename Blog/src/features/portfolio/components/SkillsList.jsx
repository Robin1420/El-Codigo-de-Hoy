import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { deleteSkill, listSkills } from "../services/skillsService";
import { Pagination } from "../../../components/ui/Pagination";
import { useToast } from "../../../components/ui/ToastProvider";

const PAGE_SIZE = 10;
const DESKTOP_GRID_STYLE = {
  gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.2fr) 140px 190px",
};

export function SkillsList() {
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

    listSkills({ page, pageSize: PAGE_SIZE, query: q })
      .then(({ data, count }) => {
        if (cancelled) return;
        setRows(data);
        setTotal(count);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "No se pudieron cargar las habilidades.");
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
    const { data, count } = await listSkills({ page, pageSize: PAGE_SIZE, query: q });
    setRows(data);
    setTotal(count);
  };

  const handleDelete = async (skillId, name) => {
    const ok = window.confirm(`?Eliminar "${name || "habilidad"}"? Esta accion no se puede deshacer.`);
    if (!ok) return;
    try {
      await deleteSkill(skillId);
      await refresh();
      toast.success("Habilidad eliminada.");
    } catch (err) {
      setError(err?.message || "No se pudo eliminar la habilidad.");
      toast.error(err?.message || "No se pudo eliminar la habilidad.");
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
              placeholder="Habilidad o categoria..."
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
            <table className="min-w-[760px] w-full border-separate border-spacing-y-3">
              <thead>
                <tr>
                  <th className="px-0 pb-2" colSpan={4}>
                    <div
                      className="grid gap-3 px-4 text-left text-sm text-[var(--subtle-text)] font-semibold"
                      style={DESKTOP_GRID_STYLE}
                    >
                      <div className="min-w-0">Habilidad</div>
                      <div className="min-w-0">Categoria</div>
                      <div className="min-w-0">Nivel</div>
                      <div className="min-w-0 text-right">Acciones</div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-3 py-6 text-sm text-[var(--subtle-text)]" colSpan={4}>
                      Cargando...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-sm text-[var(--subtle-text)]" colSpan={4}>
                      No hay habilidades aun. Crea la primera con "Nueva habilidad".
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-0 py-1.5" colSpan={4}>
                        <div className="rounded-2xl px-4 py-3 shadow-sm bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)]">
                          <div className="grid gap-3 items-center" style={DESKTOP_GRID_STYLE}>
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{row.name ?? "Sin titulo"}</p>
                            </div>
                            <div className="min-w-0 text-sm text-[var(--subtle-text)] truncate">
                              {row.category || "-"}
                            </div>
                            <div className="min-w-0 text-sm text-[var(--subtle-text)]">{row.level || "-"}/5</div>
                            <div className="min-w-0 flex items-center justify-end gap-2">
                              <Link
                                to={`/dashboard/portfolio/skills/${row.id}/edit`}
                                className="h-10 px-3 rounded-xl border border-[var(--border-color)] font-semibold hover:border-[var(--color-500)] transition-colors inline-flex items-center justify-center leading-none"
                              >
                                Editar
                              </Link>
                              <button
                                type="button"
                                className="h-10 px-3 rounded-xl border border-[rgba(248,113,113,0.35)] text-[rgba(248,113,113,0.95)] font-semibold hover:bg-[rgba(248,113,113,0.10)] transition-colors"
                                onClick={() => handleDelete(row.id, row.name)}
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
            <div className="text-sm text-[var(--subtle-text)]">No hay habilidades aun.</div>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-2xl p-4 shadow-sm bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.03)]"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold">{row.name ?? "Sin titulo"}</p>
                    <p className="text-xs text-[var(--subtle-text)]">{row.category || "-"}</p>
                    <p className="text-xs text-[var(--subtle-text)]">Nivel: {row.level || "-"}/5</p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      to={`/dashboard/portfolio/skills/${row.id}/edit`}
                      className="h-10 rounded-xl border border-[var(--border-color)] font-semibold hover:border-[var(--color-500)] transition-colors flex items-center justify-center"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="h-10 rounded-xl border border-[rgba(248,113,113,0.35)] text-[rgba(248,113,113,0.95)] font-semibold hover:bg-[rgba(248,113,113,0.10)] transition-colors"
                      onClick={() => handleDelete(row.id, row.name)}
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

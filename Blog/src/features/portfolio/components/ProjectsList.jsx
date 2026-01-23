import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { deleteProject, listProjects } from "../services/projectsService";
import { Pagination } from "../../../components/ui/Pagination";
import { useToast } from "../../../components/ui/ToastProvider";

const PAGE_SIZE = 8;
const DESKTOP_GRID_STYLE = {
  gridTemplateColumns: "minmax(0, 2.4fr) minmax(0, 1.3fr) minmax(0, 1fr) 90px 190px",
};

function getTechChips(stack = []) {
  if (!Array.isArray(stack)) return [];
  return stack.filter(Boolean);
}

function summarize(text, limit = 140) {
  const value = String(text || "");
  if (value.length <= limit) return value;
  return `${value.slice(0, limit)}...`;
}

export function ProjectsList() {
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

    listProjects({ page, pageSize: PAGE_SIZE, query: q })
      .then(({ data, count }) => {
        if (cancelled) return;
        setRows(data);
        setTotal(count);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "No se pudieron cargar los proyectos.");
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
    const { data, count } = await listProjects({ page, pageSize: PAGE_SIZE, query: q });
    setRows(data);
    setTotal(count);
  };

  const handleDelete = async (projectId, title) => {
    const ok = window.confirm(`?Eliminar "${title || "proyecto"}"? Esta acci?n no se puede deshacer.`);
    if (!ok) return;
    try {
      await deleteProject(projectId);
      await refresh();
      toast.success("Proyecto eliminado.");
    } catch (err) {
      setError(err?.message || "No se pudo eliminar el proyecto.");
      toast.error(err?.message || "No se pudo eliminar el proyecto.");
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
              placeholder={"T\u00edtulo o descripci\u00f3n..."}
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
                      <div className="min-w-0">Proyecto</div>
                      <div className="min-w-0">{"Tecnolog\u00edas"}</div>
                      <div className="min-w-0">Links</div>
                      <div className="min-w-0">{"Posici\u00f3n"}</div>
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
                      {"No hay proyectos a\u00fan. Crea el primero con \"Nuevo proyecto\"."}
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-0 py-1.5" colSpan={5}>
                        <div className="rounded-2xl px-4 py-3 shadow-sm bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)]">
                          <div className="grid gap-3 items-center" style={DESKTOP_GRID_STYLE}>
                            <div className="min-w-0 flex items-center gap-3">
                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)]">
                                {row.image_url ? (
                                  <img
                                    src={row.image_url}
                                    alt={row.title ? `Imagen: ${row.title}` : "Imagen del proyecto"}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                ) : null}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold truncate">{row.title ?? "Sin t\u00edtulo"}</p>
                                <p className="text-xs text-[var(--subtle-text)] truncate">
                                  {summarize(row.description || "Sin descripci\u00f3n")}
                                </p>
                              </div>
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap gap-2">
                                {getTechChips(row.tech_stack).length === 0 ? (
                                  <span className="text-xs text-[var(--subtle-text)]">Sin stack</span>
                                ) : (
                                  getTechChips(row.tech_stack)
                                    .slice(0, 3)
                                    .map((item) => (
                                      <span
                                        key={item}
                                        className="rounded-full border border-[var(--border-color)] px-2 py-0.5 text-[11px] font-semibold"
                                      >
                                        {item}
                                      </span>
                                    ))
                                )}
                                {getTechChips(row.tech_stack).length > 3 ? (
                                  <span className="text-[11px] text-[var(--subtle-text)]">
                                    +{getTechChips(row.tech_stack).length - 3}
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            <div className="min-w-0 flex flex-wrap gap-2">
                              {row.repo_url ? (
                                <a
                                  href={row.repo_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs font-semibold hover:border-[var(--color-500)] transition-colors"
                                >
                                  Repo
                                </a>
                              ) : null}
                              {row.demo_url ? (
                                <a
                                  href={row.demo_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs font-semibold hover:border-[var(--color-500)] transition-colors"
                                >
                                  Demo
                                </a>
                              ) : (
                                <span className="text-xs text-[var(--subtle-text)]">Sin links</span>
                              )}
                            </div>

                            <div className="min-w-0 text-sm text-[var(--subtle-text)]">{row.position ?? 1}</div>

                            <div className="min-w-0 flex items-center justify-end gap-2">
                              <Link
                                to={`/dashboard/portfolio/projects/${row.id}/edit`}
                                className="h-10 px-3 rounded-xl border border-[var(--border-color)] font-semibold hover:border-[var(--color-500)] transition-colors inline-flex items-center justify-center leading-none"
                              >
                                Editar
                              </Link>
                              <button
                                type="button"
                                className="h-10 px-3 rounded-xl border border-[rgba(248,113,113,0.35)] text-[rgba(248,113,113,0.95)] font-semibold hover:bg-[rgba(248,113,113,0.10)] transition-colors"
                                onClick={() => handleDelete(row.id, row.title)}
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

        {/* Mobile */}
        <div className="md:hidden p-4">
          {loading ? (
            <div className="text-sm text-[var(--subtle-text)]">Cargando...</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-[var(--subtle-text)]">{"No hay proyectos a\u00fan."}</div>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-2xl p-4 shadow-sm bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.03)]"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)]">
                      {row.image_url ? (
                        <img
                          src={row.image_url}
                          alt={row.title ? `Imagen: ${row.title}` : "Imagen del proyecto"}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold">{row.title ?? "Sin t\u00edtulo"}</p>
                      <p className="text-xs text-[var(--subtle-text)]">
                        {summarize(row.description || "Sin descripci\u00f3n")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {getTechChips(row.tech_stack).length === 0 ? (
                      <span className="text-xs text-[var(--subtle-text)]">Sin stack</span>
                    ) : (
                      getTechChips(row.tech_stack).map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-[var(--border-color)] px-2 py-0.5 text-[11px] font-semibold"
                        >
                          {item}
                        </span>
                      ))
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {row.repo_url ? (
                      <a
                        href={row.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-[var(--border-color)] px-3 py-1 font-semibold"
                      >
                        Repo
                      </a>
                    ) : null}
                    {row.demo_url ? (
                      <a
                        href={row.demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-[var(--border-color)] px-3 py-1 font-semibold"
                      >
                        Demo
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-[var(--subtle-text)]">
                    <span>{`Posici\u00f3n: ${row.position ?? 1}`}</span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      to={`/dashboard/portfolio/projects/${row.id}/edit`}
                      className="h-10 rounded-xl border border-[var(--border-color)] font-semibold hover:border-[var(--color-500)] transition-colors flex items-center justify-center"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="h-10 rounded-xl border border-[rgba(248,113,113,0.35)] text-[rgba(248,113,113,0.95)] font-semibold hover:bg-[rgba(248,113,113,0.10)] transition-colors"
                      onClick={() => handleDelete(row.id, row.title)}
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

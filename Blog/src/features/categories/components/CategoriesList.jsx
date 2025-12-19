import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { deleteCategory, listCategories } from "../services/categoriesService";
import { Pagination } from "../../../components/ui/Pagination";

const PAGE_SIZE = 10;

export function CategoriesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const q = searchParams.get("q") ?? "";

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const queryKey = useMemo(() => `${page}|${q}|${location.pathname}`, [page, q, location.pathname]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    listCategories({ page, pageSize: PAGE_SIZE, query: q })
      .then(({ data, count }) => {
        if (cancelled) return;
        setRows(data);
        setTotal(count);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "No se pudieron cargar las categorías.");
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
    const { data, count } = await listCategories({ page, pageSize: PAGE_SIZE, query: q });
    setRows(data);
    setTotal(count);
  };

  const handleDelete = async (categoryId, name) => {
    const ok = window.confirm(`¿Eliminar "${name || "categoría"}"? Esta acción no se puede deshacer.`);
    if (!ok) return;

    try {
      await deleteCategory(categoryId);
      await refresh();
    } catch (err) {
      setError(err?.message || "No se pudo eliminar la categoría.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="theme-surface bg-[var(--panel-color)] rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr] sm:items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--subtle-text)]">Buscar</label>
            <input
              value={q}
              onChange={(e) => setParam({ q: e.target.value, page: 1 })}
              placeholder="Nombre o slug…"
              className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
            />
          </div>
        </div>
      </section>

      {error ? (
        <section className="theme-surface bg-[var(--panel-color)] rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-[rgba(248,113,113,0.95)] font-semibold">{error}</p>
          <p className="text-xs text-[var(--subtle-text)] mt-1">
            Revisa que exista la tabla <code className="font-semibold">categories</code> y que tus policies de RLS
            permitan <code className="font-semibold">SELECT/INSERT/UPDATE/DELETE</code>.
          </p>
        </section>
      ) : null}

      <section className="theme-surface bg-[var(--panel-color)] rounded-2xl shadow-sm overflow-hidden">
        {/* Mobile: cards */}
        <div className="md:hidden">
          {loading ? (
            <div className="px-4 py-6 text-sm text-[var(--subtle-text)]">Cargando…</div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-6 text-sm text-[var(--subtle-text)]">No hay categorías aún.</div>
          ) : (
            <div className="p-4 space-y-3">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-2xl p-4 shadow-sm bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{row.name}</p>
                      <p className="text-sm text-[var(--subtle-text)] truncate">{row.slug}</p>
                    </div>
                    <p className="text-xs text-[var(--subtle-text)]">
                      {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      to={`/dashboard/categories/${row.id}/edit`}
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

        {/* Desktop: rows as cards */}
        <div className="hidden md:block p-4">
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_140px_auto] gap-3 px-3 text-sm text-[var(--subtle-text)] font-semibold">
            <div>Nombre</div>
            <div>Slug</div>
            <div>Creado</div>
            <div className="text-right">Acciones</div>
          </div>

          {loading ? (
            <div className="mt-3 text-sm text-[var(--subtle-text)] px-3 py-6">Cargando…</div>
          ) : rows.length === 0 ? (
            <div className="mt-3 text-sm text-[var(--subtle-text)] px-3 py-6">No hay categorías aún.</div>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-2xl px-3 py-3 shadow-sm bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)]"
                >
                  <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_140px_auto] gap-3 items-center">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{row.name}</p>
                    </div>
                    <div className="min-w-0 text-sm text-[var(--subtle-text)] truncate">{row.slug}</div>
                    <div className="text-sm text-[var(--subtle-text)]">
                      {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/dashboard/categories/${row.id}/edit`}
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

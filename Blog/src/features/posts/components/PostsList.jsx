import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { deletePost, getPostById, listPosts } from "../services/postsService";
import { StatusBadge } from "./StatusBadge";
import { Pagination } from "../../../components/ui/Pagination";
import { Modal } from "../../../components/ui/Modal";
import { PostPreview } from "./PostPreview";

const PAGE_SIZE = 10;
const DESKTOP_GRID_STYLE = {
  gridTemplateColumns:
    "minmax(0, 2.2fr) minmax(0, 1.2fr) minmax(0, 1.2fr) 140px 120px 220px",
};

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "—";
  }
}

export function PostsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const page = Number(searchParams.get("page") ?? "1") || 1;
  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "all";

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewId, setPreviewId] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const queryKey = useMemo(() => `${page}|${q}|${status}|${location.pathname}`, [page, q, status, location.pathname]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    listPosts({ page, pageSize: PAGE_SIZE, query: q, status })
      .then(({ data, count }) => {
        if (cancelled) return;
        setRows(data);
        setTotal(count);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "No se pudieron cargar los artículos.");
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

  useEffect(() => {
    if (!previewId) return;
    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError("");

    getPostById(previewId)
      .then((data) => {
        if (cancelled) return;
        setPreviewPost(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setPreviewError(err?.message || "No se pudo cargar la vista previa.");
        setPreviewPost(null);
      })
      .finally(() => {
        if (cancelled) return;
        setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [previewId]);

  const refresh = async () => {
    const { data, count } = await listPosts({ page, pageSize: PAGE_SIZE, query: q, status });
    setRows(data);
    setTotal(count);
  };

  const handleDelete = async (postId, title) => {
    const ok = window.confirm(`¿Eliminar "${title || "artículo"}"? Esta acción no se puede deshacer.`);
    if (!ok) return;

    try {
      await deletePost(postId);
      await refresh();
    } catch (err) {
      setError(err?.message || "No se pudo eliminar el artículo.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Modal
        open={Boolean(previewId)}
        title={previewPost?.title ? `Vista previa: ${previewPost.title}` : "Vista previa"}
        onClose={() => {
          setPreviewId(null);
          setPreviewPost(null);
          setPreviewError("");
        }}
        maxWidthClassName="max-w-4xl"
      >
        {previewLoading ? (
          <div className="text-sm text-[var(--subtle-text)]">Cargando vista previa…</div>
        ) : previewError ? (
          <div className="rounded-xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] px-4 py-3">
            <p className="text-sm font-semibold text-[rgba(248,113,113,0.95)]">{previewError}</p>
          </div>
        ) : (
          <PostPreview post={previewPost} />
        )}
      </Modal>

      <section className="theme-surface bg-[var(--panel-color)] rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr,220px] sm:items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--subtle-text)]">Buscar</label>
            <input
              value={q}
              onChange={(e) => setParam({ q: e.target.value, page: 1 })}
              placeholder="Título o slug…"
              className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--subtle-text)]">Estado</label>
            <select
              value={status}
              onChange={(e) => setParam({ status: e.target.value, page: 1 })}
              className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
            >
              <option value="all">Todos</option>
              <option value="draft">Borrador</option>
              <option value="pending">Pendiente</option>
              <option value="published">Publicado</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>
        </div>
      </section>

      {error ? (
        <section className="theme-surface bg-[var(--panel-color)] rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-[rgba(248,113,113,0.95)] font-semibold">{error}</p>
          <p className="text-xs text-[var(--subtle-text)] mt-1">
            Verifica RLS/policies en <code className="font-semibold">posts</code>.
          </p>
        </section>
      ) : null}

      <section className="theme-surface bg-[var(--panel-color)] rounded-2xl shadow-sm overflow-hidden">
        {/* Mobile: cards */}
        <div className="md:hidden">
          {loading ? (
            <div className="px-4 py-6 text-sm text-[var(--subtle-text)]">Cargando…</div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-6 text-sm text-[var(--subtle-text)]">
              No hay artículos aún. Crea el primero con “Nuevo artículo”.
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-2xl p-4 shadow-sm bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.03)]"
                  role="button"
                  tabIndex={0}
                  onClick={() => setPreviewId(row.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setPreviewId(row.id);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex items-start gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)]">
                        {row.cover_image_url ? (
                          <img
                            src={row.cover_image_url}
                            alt={row.title ? `Portada: ${row.title}` : "Portada del artículo"}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : null}
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold truncate">{row.title ?? "Sin título"}</p>
                        <p className="text-sm text-[var(--subtle-text)] truncate">{row.slug ?? "—"}</p>
                        <p className="text-xs text-[var(--subtle-text)] mt-1">
                          {row.categories?.name ? `Categoría: ${row.categories.name}` : "Sin categoría"}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={row.status} />
                  </div>

                  <p className="mt-2 text-xs text-[var(--subtle-text)]">
                    {row.published_at ? `Publicado: ${formatDate(row.published_at)}` : `Creado: ${formatDate(row.created_at)}`}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      to={`/dashboard/posts/${row.id}/edit`}
                      className="h-10 rounded-xl border border-[var(--border-color)] font-semibold hover:border-[var(--color-500)] transition-colors flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="h-10 rounded-xl border border-[rgba(248,113,113,0.35)] text-[rgba(248,113,113,0.95)] font-semibold hover:bg-[rgba(248,113,113,0.10)] transition-colors"
                      onClick={() => handleDelete(row.id, row.title)}
                      onClickCapture={(e) => e.stopPropagation()}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop: rows as cards (sin líneas) */}
        <div className="hidden md:block p-4">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full border-separate border-spacing-y-3">
              <thead>
                <tr>
                  <th className="px-0 pb-2" colSpan={6}>
                    <div
                      className="grid gap-3 px-4 text-left text-sm text-[var(--subtle-text)] font-semibold"
                      style={DESKTOP_GRID_STYLE}
                    >
                      <div className="min-w-0">Título</div>
                      <div className="min-w-0">Categoría</div>
                      <div className="min-w-0">Slug</div>
                      <div className="min-w-0">Estado</div>
                      <div className="min-w-0">Fecha</div>
                      <div className="min-w-0 text-right">Acciones</div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-3 py-6 text-sm text-[var(--subtle-text)]" colSpan={6}>
                      Cargando…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-sm text-[var(--subtle-text)]" colSpan={6}>
                      No hay artículos aún. Crea el primero con “Nuevo artículo”.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-0 py-1.5" colSpan={6}>
                        <div
                          className="rounded-2xl px-4 py-3 shadow-sm bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)] cursor-pointer"
                          role="button"
                          tabIndex={0}
                          onClick={() => setPreviewId(row.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") setPreviewId(row.id);
                          }}
                        >
                          <div className="grid gap-3 items-center" style={DESKTOP_GRID_STYLE}>
                            <div className="min-w-0 flex items-center gap-3">
                              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)]">
                                {row.cover_image_url ? (
                                  <img
                                    src={row.cover_image_url}
                                    alt={row.title ? `Portada: ${row.title}` : "Portada del artículo"}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                ) : null}
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold truncate">{row.title ?? "Sin título"}</p>
                                <p className="text-xs text-[var(--subtle-text)] truncate">
                                  {row.published_at
                                    ? `Publicado: ${formatDate(row.published_at)}`
                                    : `Creado: ${formatDate(row.created_at)}`}
                                </p>
                              </div>
                            </div>

                            <div className="min-w-0 text-sm text-[var(--subtle-text)] truncate">
                              {row.categories?.name ?? "Sin categoría"}
                            </div>

                            <div className="min-w-0 text-sm text-[var(--subtle-text)] truncate">
                              {row.slug ?? "—"}
                            </div>

                            <div className="min-w-0">
                              <StatusBadge status={row.status} />
                            </div>

                            <div className="min-w-0 text-sm text-[var(--subtle-text)]">
                              {row.published_at ? formatDate(row.published_at) : formatDate(row.created_at)}
                            </div>

                            <div className="min-w-0 flex items-center justify-end gap-2">
                              <Link
                                to={`/dashboard/posts/${row.id}/edit`}
                                className="h-10 px-3 rounded-xl border border-[var(--border-color)] font-semibold hover:border-[var(--color-500)] transition-colors inline-flex items-center justify-center leading-none"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Editar
                              </Link>
                              <button
                                type="button"
                                className="h-10 px-3 rounded-xl border border-[rgba(248,113,113,0.35)] text-[rgba(248,113,113,0.95)] font-semibold hover:bg-[rgba(248,113,113,0.10)] transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(row.id, row.title);
                                }}
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
      </section>

      <section className="theme-surface bg-[var(--panel-color)] rounded-2xl shadow-sm p-4">
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={(next) => setParam({ page: next })} />
      </section>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { listPages, deletePage, getPageById } from "../services/pagesService";
import { Pagination } from "../../../components/ui/Pagination";
import { Modal } from "../../../components/ui/Modal";
import { PostPreview } from "../../posts/components/PostPreview";
import { useToast } from "../../../components/ui/ToastProvider";
import { FullScreenLoader } from "../../../components/ui/FullScreenLoader";

const PAGE_SIZE = 10;

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}

export function PagesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const page = Number(searchParams.get("page") ?? "1") || 1;
  const q = searchParams.get("q") ?? "";

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewId, setPreviewId] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const toast = useToast();

  const queryKey = useMemo(() => `${page}|${q}|${location.pathname}`, [page, q, location.pathname]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    listPages({ page, pageSize: PAGE_SIZE, query: q })
      .then(({ data, count }) => {
        if (cancelled) return;
        setRows(data);
        setTotal(count);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "No se pudieron cargar las páginas.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [queryKey]);

  useEffect(() => {
    if (!previewId) return;
    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError("");

    getPageById(previewId)
      .then((data) => {
        if (cancelled) return;
        setPreviewPost({
          ...data,
          categories: null,
          post_tags: [],
          youtube_url: "",
          youtube_links: [],
          status: "published",
          excerpt: "",
          cover_image_url: null,
        });
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
    const { data, count } = await listPages({ page, pageSize: PAGE_SIZE, query: q });
    setRows(data);
    setTotal(count);
  };

  const handleDelete = async (pageId, title) => {
    const ok = window.confirm(`¿Eliminar "${title || "página"}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      await deletePage(pageId);
      await refresh();
      toast.success("Página eliminada.");
    } catch (err) {
      setError(err?.message || "No se pudo eliminar la página.");
      toast.error(err?.message || "No se pudo eliminar la página.");
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
          <FullScreenLoader fullScreen={false} label="Cargando vista previa" minHeightClassName="min-h-[220px]" />
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
              placeholder="Título…"
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
            <table className="min-w-[860px] w-full border-separate border-spacing-y-3">
              <thead>
                <tr>
                  <th className="px-0 pb-2" colSpan={4}>
                    <div className="grid gap-3 px-4 text-left text-sm text-[var(--subtle-text)] font-semibold grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_160px]">
                      <div>Título</div>
                      <div>Autor</div>
                      <div>Última edición</div>
                      <div className="text-right">Acciones</div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-3 py-6 text-sm text-[var(--subtle-text)]" colSpan={4}>
                      Cargando…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-sm text-[var(--subtle-text)]" colSpan={4}>
                      No hay páginas aún. Crea la primera con “Nueva página”.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-0 py-1.5" colSpan={4}>
                        <div
                          className="rounded-2xl px-4 py-3 shadow-sm bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)] cursor-pointer"
                          role="button"
                          tabIndex={0}
                          onClick={() => setPreviewId(row.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") setPreviewId(row.id);
                          }}
                        >
                          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_160px] gap-3 items-center">
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{row.title ?? "Sin título"}</p>
                              <p className="text-xs text-[var(--subtle-text)] truncate">ID: {row.id}</p>
                            </div>
                            <div className="min-w-0 text-sm text-[var(--subtle-text)] truncate">
                              {row.profiles?.full_name || "—"}
                            </div>
                            <div className="min-w-0 text-sm text-[var(--subtle-text)] truncate">
                              {formatDate(row.last_edited_at)}
                            </div>
                            <div className="min-w-0 flex items-center justify-end gap-2">
                              <Link
                                to={`/dashboard/pages/${row.id}/edit`}
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

        {/* Mobile: cards */}
        <div className="md:hidden p-4">
          {loading ? (
            <div className="text-sm text-[var(--subtle-text)]">Cargando…</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-[var(--subtle-text)]">No hay páginas aún.</div>
          ) : (
            <div className="space-y-3">
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
                  <p className="font-semibold">{row.title ?? "Sin título"}</p>
                  <p className="text-xs text-[var(--subtle-text)]">Autor: {row.profiles?.full_name || "—"}</p>
                  <p className="text-xs text-[var(--subtle-text)]">Editado: {formatDate(row.last_edited_at)}</p>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      to={`/dashboard/pages/${row.id}/edit`}
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
      </section>

      <section className="theme-surface bg-[var(--panel-color)] rounded-2xl shadow-sm p-4">
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={(next) => setParam({ page: next })} />
      </section>
    </div>
  );
}

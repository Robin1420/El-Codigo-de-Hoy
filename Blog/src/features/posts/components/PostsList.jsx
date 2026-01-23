import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  deletePost,
  getPostById,
  getPostViewsCount,
  listPostVersions,
  listPostViews,
  listPosts,
} from "../services/postsService";
import { StatusBadge } from "./StatusBadge";
import { Pagination } from "../../../components/ui/Pagination";
import { Modal } from "../../../components/ui/Modal";
import { PostPreview } from "./PostPreview";
import { FullScreenLoader } from "../../../components/ui/FullScreenLoader";
import { useToast } from "../../../components/ui/ToastProvider";

const PAGE_SIZE = 10;
const DESKTOP_GRID_STYLE = {
  gridTemplateColumns:
    "minmax(0, 2.2fr) minmax(0, 1.2fr) minmax(0, 1.2fr) 140px 120px 260px",
};

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "—";
  }
}

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}


function getContentText(content) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (typeof content === "object") return content.body || content.text || content.markdown || "";
  return "";
}

function summarize(text, limit = 140) {
  const value = String(text || "");
  if (value.length <= limit) return value;
  return value.slice(0, limit) + "...";
}

function normalizeArray(value) {
  if (!Array.isArray(value)) return [];
  return [...value].map((item) => String(item)).sort();
}

function isEqualValue(a, b) {
  if (Array.isArray(a) || Array.isArray(b)) {
    const left = normalizeArray(a);
    const right = normalizeArray(b);
    return left.length === right.length && left.every((item, index) => item === right[index]);
  }
  return String(a ?? "") === String(b ?? "");
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Si" : "No";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  return String(value);
}

function buildChanges(snapshot, current) {
  if (!snapshot || !current) return [];
  const changes = [];
  const addChange = (label, before, after, formatter = formatValue) => {
    if (!isEqualValue(before, after)) {
      changes.push({ label, before: formatter(before), after: formatter(after) });
    }
  };

  addChange("Titulo", snapshot.title, current.title);
  addChange("Slug", snapshot.slug, current.slug);
  addChange("Estado", snapshot.status, current.status);
  addChange("Resumen", summarize(snapshot.excerpt), summarize(current.excerpt));
  addChange("Categoria (ID)", snapshot.category_id, current.category_id);
  addChange("Publicado", snapshot.published_at, current.published_at);
  addChange("Portada", snapshot.cover_image_url, current.cover_image_url);
  addChange("Video", snapshot.youtube_url, current.youtube_url);
  addChange("Tags (IDs)", snapshot.tag_ids, current.tag_ids);
  addChange("SEO title", snapshot.seo_title, current.seo_title);
  addChange("SEO description", summarize(snapshot.seo_description), summarize(current.seo_description));
  addChange("Canonical", snapshot.canonical_url, current.canonical_url);
  addChange("No index", snapshot.no_index, current.no_index);

  return changes;
}

function getContentChange(snapshot, current) {
  if (!snapshot || !current) return null;
  const snapshotContentRaw = getContentText(snapshot.content);
  const currentContentRaw = getContentText(current.content);
  if (isEqualValue(snapshotContentRaw, currentContentRaw)) return null;
  return {
    before: snapshotContentRaw,
    after: currentContentRaw,
  };
}

function getInitials(name) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return "US";
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("");
}

function HistoryIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M3 12a9 9 0 1 0 3-6.708"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 4v3.5h3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function getTagNames(row) {
  return row?.post_tags?.map((item) => item?.tags?.name).filter(Boolean) ?? [];
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
  const [historyPostId, setHistoryPostId] = useState(null);
  const [historyRows, setHistoryRows] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyCurrentPost, setHistoryCurrentPost] = useState(null);
  const [historyDetail, setHistoryDetail] = useState(null);
  const [viewsByPostId, setViewsByPostId] = useState({});
  const [viewsLoadingByPostId, setViewsLoadingByPostId] = useState({});
  const [viewsPostId, setViewsPostId] = useState(null);
  const [viewsRows, setViewsRows] = useState([]);
  const [viewsLoading, setViewsLoading] = useState(false);
  const [viewsError, setViewsError] = useState("");
  const toast = useToast();

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

  useEffect(() => {
    if (!historyPostId) return;
    let cancelled = false;
    setHistoryLoading(true);
    setHistoryError("");
    setHistoryCurrentPost(null);

    Promise.allSettled([listPostVersions(historyPostId), getPostById(historyPostId)])
      .then((results) => {
        if (cancelled) return;
        const [versionsResult, currentResult] = results;
        if (versionsResult.status === "fulfilled") {
          const ordered = [...versionsResult.value].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          );
          setHistoryRows(ordered);
        } else {
          setHistoryError(versionsResult.reason?.message || "No se pudo cargar el historial.");
          setHistoryRows([]);
        }
        if (currentResult.status === "fulfilled") {
          setHistoryCurrentPost(currentResult.value);
        } else {
          setHistoryCurrentPost(null);
        }
      })
      .finally(() => {
        if (cancelled) return;
        setHistoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [historyPostId]);

  useEffect(() => {
    if (!rows.length) return;
    let cancelled = false;
    const fetchViews = async () => {
      const missing = rows.filter(
        (row) => viewsByPostId[row.id] === undefined && !viewsLoadingByPostId[row.id],
      );
      if (!missing.length) return;
      missing.forEach((row) => {
        setViewsLoadingByPostId((prev) => ({ ...prev, [row.id]: true }));
      });
      await Promise.all(
        missing.map(async (row) => {
          try {
            const count = await getPostViewsCount(row.id);
            if (cancelled) return;
            setViewsByPostId((prev) => ({ ...prev, [row.id]: count }));
          } finally {
            if (cancelled) return;
            setViewsLoadingByPostId((prev) => ({ ...prev, [row.id]: false }));
          }
        }),
      );
    };

    fetchViews();
    return () => {
      cancelled = true;
    };
  }, [rows, viewsByPostId, viewsLoadingByPostId]);

  useEffect(() => {
    if (!viewsPostId) return;
    let cancelled = false;
    setViewsLoading(true);
    setViewsError("");

    listPostViews(viewsPostId)
      .then((rows) => {
        if (cancelled) return;
        setViewsRows(rows);
      })
      .catch((err) => {
        if (cancelled) return;
        setViewsError(err?.message || "No se pudieron cargar las vistas.");
        setViewsRows([]);
      })
      .finally(() => {
        if (cancelled) return;
        setViewsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [viewsPostId]);

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
      toast.success("Artículo eliminado.");
    } catch (err) {
      setError(err?.message || "No se pudo eliminar el artículo.");
      toast.error(err?.message || "No se pudo eliminar el artículo.");
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

      <Modal
        open={Boolean(historyPostId)}
        title="Historial de versiones"
        onClose={() => {
          setHistoryPostId(null);
          setHistoryRows([]);
          setHistoryError("");
          setHistoryCurrentPost(null);
          setHistoryDetail(null);
        }}
        maxWidthClassName="max-w-2xl"
      >
        {historyLoading ? (
          <div className="text-sm text-[var(--subtle-text)]">Cargando historial…</div>
        ) : historyError ? (
          <div className="rounded-xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] px-4 py-3">
            <p className="text-sm font-semibold text-[rgba(248,113,113,0.95)]">{historyError}</p>
          </div>
        ) : historyRows.length === 0 ? (
          <p className="text-sm text-[var(--subtle-text)]">No hay versiones anteriores.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {historyRows.map((row) => {
              const snapshot = row?.content_snapshot || {};
              const title = snapshot.title || "Sin título";
              const status = snapshot.status || "draft";
              const tagCount = Array.isArray(snapshot.tag_ids) ? snapshot.tag_ids.length : 0;
              return (
                <div
                  key={row.id}
                  className="rounded-2xl border border-[var(--border-color)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)] p-3 cursor-pointer hover:border-[var(--color-500)] transition-colors"
                  role="button"
                  tabIndex={0}
                  onClick={() => setHistoryDetail({ snapshot, createdAt: row.created_at })}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      setHistoryDetail({ snapshot, createdAt: row.created_at });
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{title}</p>
                      <p className="text-xs text-[var(--subtle-text)]">
                        Guardado: {formatDateTime(row.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  <div className="mt-2 text-xs text-[var(--subtle-text)]">
                    Slug: {snapshot.slug || "—"} · Tags: {tagCount}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(historyDetail)}
        title="Cambios en la version"
        onClose={() => setHistoryDetail(null)}
        maxWidthClassName="max-w-3xl"
      >
        {historyDetail ? (
          <div className="flex flex-col gap-4">
            <div className="text-xs text-[var(--subtle-text)]">
              Version guardada: {formatDateTime(historyDetail.createdAt)}
            </div>
            {historyCurrentPost ? (
              (() => {
                const changes = buildChanges(historyDetail.snapshot, historyCurrentPost);
                const contentChange = getContentChange(historyDetail.snapshot, historyCurrentPost);
                if (!changes.length && !contentChange) {
                  return (
                    <p className="text-sm text-[var(--subtle-text)]">
                      No hay diferencias con la version actual.
                    </p>
                  );
                }
                return (
                  <div className="space-y-3">
                    {changes.length ? (
                      <div className="space-y-3">
                        {changes.map((change) => (
                          <div
                            key={change.label}
                            className="rounded-xl border border-[var(--border-color)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)] p-3"
                          >
                            <p className="text-xs font-semibold text-[var(--subtle-text)]">{change.label}</p>
                            <div className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
                              <div>
                                <p className="text-xs text-[var(--subtle-text)]">Antes</p>
                                <p className="font-medium break-words">{change.before}</p>
                              </div>
                              <div>
                                <p className="text-xs text-[var(--subtle-text)]">Ahora</p>
                                <p className="font-medium break-words">{change.after}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {contentChange ? (
                      <div className="rounded-2xl border border-[var(--border-color)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)] p-3">
                        <p className="text-xs font-semibold text-[var(--subtle-text)]">
                          Contenido (codigo)
                        </p>
                        <div className="mt-2 grid gap-3 text-xs sm:grid-cols-2">
                          <div className="flex flex-col gap-2">
                            <p className="text-xs text-[var(--subtle-text)]">Antes</p>
                            <pre className="max-h-64 overflow-auto rounded-lg border border-[var(--border-color)] bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(0,0,0,0.35)] p-3 font-mono whitespace-pre-wrap break-words">
                              <code>{contentChange.before}</code>
                            </pre>
                          </div>
                          <div className="flex flex-col gap-2">
                            <p className="text-xs text-[var(--subtle-text)]">Ahora</p>
                            <pre className="max-h-64 overflow-auto rounded-lg border border-[var(--border-color)] bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(0,0,0,0.35)] p-3 font-mono whitespace-pre-wrap break-words">
                              <code>{contentChange.after}</code>
                            </pre>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })()
            ) : (
              <p className="text-sm text-[var(--subtle-text)]">
                No se pudo cargar el post actual para comparar los cambios.
              </p>
            )}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(viewsPostId)}
        title="Usuarios que vieron el post"
        onClose={() => {
          setViewsPostId(null);
          setViewsRows([]);
          setViewsError("");
        }}
        maxWidthClassName="max-w-2xl"
      >
        {viewsLoading ? (
          <FullScreenLoader fullScreen={false} label="Cargando vistas" minHeightClassName="min-h-[220px]" />
        ) : viewsError ? (
          <div className="rounded-xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] px-4 py-3">
            <p className="text-sm font-semibold text-[rgba(248,113,113,0.95)]">{viewsError}</p>
          </div>
        ) : viewsRows.length === 0 ? (
          <p className="text-sm text-[var(--subtle-text)]">Sin vistas registradas.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {viewsRows.map((row) => {
              const profile = row?.profiles ?? null;
              const name = profile?.full_name || "Usuario";
              const role = profile?.role || "Sin rol";
              const isAnon = !row?.user_id;
              return (
                <div
                  key={row.id}
                  className="rounded-2xl border border-[var(--border-color)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full border border-[var(--border-color)] overflow-hidden bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(255,255,255,0.04)] flex items-center justify-center text-xs font-semibold">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span>{getInitials(name)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{isAnon ? "Anónimo" : name}</p>
                      <p className="text-xs text-[var(--subtle-text)]">
                        {isAnon ? "Sin usuario registrado" : `Rol: ${role}`}
                      </p>
                    </div>
                    <div className="ml-auto text-xs text-[var(--subtle-text)]">
                      {formatDateTime(row.visited_at)}
                    </div>
                  </div>
                  {isAnon ? (
                    <div className="mt-2 text-xs text-[var(--subtle-text)]">
                      {row.ip_hash ? `IP hash: ${row.ip_hash}` : "IP hash: —"}
                    </div>
                  ) : null}
                  {row.user_agent ? (
                    <div className="mt-1 text-xs text-[var(--subtle-text)] truncate">
                      {row.user_agent}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
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
                        <div className="mt-2 flex flex-wrap gap-2">
                          {getTagNames(row).length === 0 ? (
                            <span className="text-xs text-[var(--subtle-text)]">Sin tags</span>
                          ) : (
                            getTagNames(row).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-[var(--border-color)] px-2 py-0.5 text-[11px] font-semibold"
                              >
                                #{tag}
                              </span>
                            ))
                          )}
                        </div>
                        <button
                          type="button"
                          className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] px-2 py-0.5 text-[11px] font-semibold"
                          onClick={(event) => {
                            event.stopPropagation();
                            setViewsPostId(row.id);
                          }}
                        >
                          <EyeIcon className="h-3.5 w-3.5" />
                          <span>Vistas: {viewsByPostId[row.id] ?? 0}</span>
                        </button>

                        
                      </div>
                    </div>
                    <StatusBadge status={row.status} />
                  </div>

                  <p className="mt-2 text-xs text-[var(--subtle-text)]">
                    {row.published_at ? `Publicado: ${formatDate(row.published_at)}` : `Creado: ${formatDate(row.created_at)}`}
                  </p>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
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
                    <button
                      type="button"
                      className="h-10 rounded-xl bg-[var(--color-500)] text-white font-semibold shadow-sm hover:bg-[var(--color-600)] transition-colors flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHistoryPostId(row.id);
                      }}
                      aria-label="Historial"
                      title="Historial"
                    >
                      <HistoryIcon className="h-5 w-5" />
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
            <table className="min-w-[1040px] w-full border-separate border-spacing-y-3">
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
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {getTagNames(row).length === 0 ? (
                                    <span className="text-xs text-[var(--subtle-text)]">Sin tags</span>
                                  ) : (
                                    getTagNames(row).map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded-full border border-[var(--border-color)] px-2 py-0.5 text-[11px] font-semibold"
                                      >
                                        #{tag}
                                      </span>
                                    ))
                                  )}
                                </div>
                                <button
                                  type="button"
                                  className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] px-2 py-0.5 text-[11px] font-semibold"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setViewsPostId(row.id);
                                  }}
                                >
                                  <EyeIcon className="h-3.5 w-3.5" />
                                  <span>Vistas: {viewsByPostId[row.id] ?? 0}</span>
                                </button>

                                
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
                              <button
                                type="button"
                                className="h-10 w-10 rounded-xl bg-[var(--color-500)] text-white shadow-sm hover:bg-[var(--color-600)] transition-colors inline-flex items-center justify-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setHistoryPostId(row.id);
                                }}
                                aria-label="Historial"
                                title="Historial"
                              >
                                <HistoryIcon className="h-5 w-5" />
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

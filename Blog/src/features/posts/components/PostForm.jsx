import { useEffect, useMemo, useState } from "react";
import { slugify } from "../../../lib/slugify";
import { listAllCategories } from "../../categories/services/categoriesService";
import { supabase } from "../../../lib/supabaseClient";

const COVER_BUCKET = "covers";
const MAX_COVER_MB = 15;

function toDatetimeLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}

function nowDatetimeLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}

function getContentText(content) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (typeof content === "object") return content.body || content.text || content.markdown || "";
  return "";
}

function safeFileExt(name) {
  const parts = String(name || "").split(".");
  const ext = parts.length > 1 ? parts[parts.length - 1] : "";
  return ext.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
}

function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function PostForm({
  mode,
  initialValues,
  onSubmit,
  submitting,
  submitLabel,
  error,
  onCancel,
  variant = "card",
}) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [status, setStatus] = useState(initialValues?.status ?? "draft");
  const [excerpt, setExcerpt] = useState(initialValues?.excerpt ?? "");
  const [contentText, setContentText] = useState(getContentText(initialValues?.content));
  const [coverImageUrl, setCoverImageUrl] = useState(initialValues?.cover_image_url ?? "");
  const [categoryId, setCategoryId] = useState(
    initialValues?.category_id === null || initialValues?.category_id === undefined
      ? ""
      : String(initialValues.category_id),
  );
  const [publishedAt, setPublishedAt] = useState(toDatetimeLocal(initialValues?.published_at));

  const [seoTitle, setSeoTitle] = useState(initialValues?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(initialValues?.seo_description ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialValues?.canonical_url ?? "");
  const [noIndex, setNoIndex] = useState(Boolean(initialValues?.no_index));

  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [categories, setCategories] = useState([]);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState("");

  useEffect(() => {
    if (!autoSlug) return;
    setSlug(slugify(title));
  }, [title, autoSlug]);

  useEffect(() => {
    setTitle(initialValues?.title ?? "");
    setSlug(initialValues?.slug ?? "");
    setStatus(initialValues?.status ?? "draft");
    setExcerpt(initialValues?.excerpt ?? "");
    setContentText(getContentText(initialValues?.content));
    setCoverImageUrl(initialValues?.cover_image_url ?? "");
    setCategoryId(
      initialValues?.category_id === null || initialValues?.category_id === undefined
        ? ""
        : String(initialValues.category_id),
    );
    setPublishedAt(toDatetimeLocal(initialValues?.published_at));
    setSeoTitle(initialValues?.seo_title ?? "");
    setSeoDescription(initialValues?.seo_description ?? "");
    setCanonicalUrl(initialValues?.canonical_url ?? "");
    setNoIndex(Boolean(initialValues?.no_index));
  }, [initialValues]);

  useEffect(() => {
    let cancelled = false;
    listAllCategories()
      .then((rows) => {
        if (cancelled) return;
        setCategories(rows);
      })
      .catch(() => {
        if (cancelled) return;
        setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  const uploadCover = async (file) => {
    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      setCoverUploadError("Selecciona un archivo de imagen (PNG/JPG/WebP).");
      return;
    }

    const maxBytes = MAX_COVER_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      setCoverUploadError(`La imagen es muy pesada. Máximo ${MAX_COVER_MB}MB.`);
      return;
    }

    setCoverUploadError("");
    setCoverUploading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Necesitas iniciar sesión para subir imágenes.");

      const ext = safeFileExt(file.name) || "png";
      const filePath = `posts/${user.id}/${randomId()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(COVER_BUCKET).upload(filePath, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: "3600",
      });

      if (uploadError) {
        if (String(uploadError.message || "").toLowerCase().includes("bucket")) {
          throw new Error(`No existe el bucket "${COVER_BUCKET}". Créalo en Supabase Storage (público).`);
        }
        throw uploadError;
      }

      const { data: urlData } = supabase.storage.from(COVER_BUCKET).getPublicUrl(filePath);
      if (!urlData?.publicUrl) throw new Error("No se pudo obtener la URL pública de la imagen.");

      setCoverImageUrl(urlData.publicUrl);
    } catch (err) {
      setCoverUploadError(err?.message || "No se pudo subir la imagen.");
    } finally {
      setCoverUploading(false);
    }
  };

  const formClassName =
    variant === "modal"
      ? "flex flex-col gap-4"
      : "theme-surface bg-[var(--panel-color)] rounded-2xl p-4 shadow-sm";

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
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit || submitting) return;

        const finalPublishedAt =
          status === "published" ? (publishedAt || nowDatetimeLocal()) : publishedAt || null;

        onSubmit({
          title: title.trim(),
          slug: slug.trim() || slugify(title),
          excerpt: excerpt.trim() || null,
          content: contentText.trim() ? { type: "markdown", body: contentText.trim() } : null,
          cover_image_url: coverImageUrl.trim() || null,
          category_id: categoryId ? Number(categoryId) : null,
          status,
          published_at: finalPublishedAt,
          seo_title: seoTitle.trim() || null,
          seo_description: seoDescription.trim() || null,
          canonical_url: canonicalUrl.trim() || null,
          no_index: Boolean(noIndex),
        });
      }}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del artículo…"
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">Estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          >
            <option value="draft">Borrador</option>
            <option value="pending">Pendiente</option>
            <option value="published">Publicado</option>
            <option value="rejected">Rechazado</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">Categoría</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">Publicación</label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          />
          <p className="text-xs text-[var(--subtle-text)]">
            Si el estado es “Publicado” y no defines fecha, se asigna la actual.
          </p>
        </div>

        <div className="flex flex-col gap-2 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-[var(--subtle-text)]">Slug</label>
            <label className="inline-flex items-center gap-2 text-xs text-[var(--subtle-text)] select-none">
              <input
                type="checkbox"
                className="accent-[var(--color-500)]"
                checked={autoSlug}
                onChange={(e) => setAutoSlug(e.target.checked)}
              />
              Auto
            </label>
          </div>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="slug-del-articulo"
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          />
          <p className="text-xs text-[var(--subtle-text)]">
            Recomendado: único, sin espacios. Se usa para URLs tipo <code>/blog/:slug</code>.
          </p>
        </div>

        <div className="flex flex-col gap-2 lg:col-span-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">Portada</label>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[220px,1fr]">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)] overflow-hidden">
              {coverImageUrl ? (
                <img
                  src={coverImageUrl}
                  alt="Portada"
                  className="w-full h-[140px] object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-[140px] flex items-center justify-center text-xs text-[var(--subtle-text)]">
                  Sin portada
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[var(--subtle-text)]">URL (opcional)</label>
                <input
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://…"
                  className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
                />
                <p className="text-xs text-[var(--subtle-text)]">
                  Puedes pegar una URL o subir una imagen a Supabase Storage (bucket: <code>{COVER_BUCKET}</code>).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label
                  className={[
                    "h-11 px-4 rounded-xl font-semibold transition-colors shadow-sm cursor-pointer select-none",
                    "border border-[var(--color-500)]",
                    coverUploading
                      ? "opacity-70 cursor-not-allowed bg-[var(--color-500)] text-white"
                      : "bg-[var(--color-500)] text-white hover:bg-[var(--color-600)]",
                  ].join(" ")}
                >
                  {coverUploading ? "Subiendo…" : "Subir imagen"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={coverUploading || submitting}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      uploadCover(f);
                    }}
                  />
                </label>

                {coverImageUrl ? (
                  <button
                    type="button"
                    className="h-11 px-4 rounded-xl border border-[var(--border-color)] font-semibold hover:border-[var(--color-500)] transition-colors"
                    onClick={() => setCoverImageUrl("")}
                    disabled={coverUploading || submitting}
                  >
                    Quitar
                  </button>
                ) : null}
              </div>

              {coverUploadError ? (
                <div className="rounded-xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] px-4 py-3">
                  <p className="text-sm font-semibold text-[rgba(248,113,113,0.95)]">{coverUploadError}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:col-span-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">Resumen</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            placeholder="Resumen corto para listados y SEO…"
            className="rounded-xl border border-[var(--border-color)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-500)] transition-colors resize-y"
          />
        </div>

        <div className="flex flex-col gap-2 lg:col-span-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">Contenido</label>
          <textarea
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            rows={12}
            placeholder="Contenido del artículo (por ahora Markdown)…"
            className="rounded-xl border border-[var(--border-color)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-500)] transition-colors resize-y"
          />
        </div>

        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-[var(--subtle-text)]">SEO</label>
            <label className="inline-flex items-center gap-2 text-xs text-[var(--subtle-text)] select-none">
              <input
                type="checkbox"
                className="accent-[var(--color-500)]"
                checked={noIndex}
                onChange={(e) => setNoIndex(e.target.checked)}
              />
              No index
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[var(--subtle-text)]">SEO title</label>
              <input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Título SEO…"
                className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[var(--subtle-text)]">Canonical URL</label>
              <input
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://…"
                className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[var(--subtle-text)]">SEO description</label>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={3}
              placeholder="Descripción SEO…"
              className="rounded-xl border border-[var(--border-color)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-500)] transition-colors resize-y"
            />
          </div>
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
          {submitting ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

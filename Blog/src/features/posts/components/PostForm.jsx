import { useEffect, useMemo, useState } from "react";
import { slugify } from "../../../lib/slugify";
import { listAllCategories } from "../../categories/services/categoriesService";
import { createTag, listAllTags } from "../../tags/services/tagsService";
import { supabase } from "../../../lib/supabaseClient";
import { useToast } from "../../../components/ui/ToastProvider";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { Modal } from "../../../components/ui/Modal";

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

function getContentType(content, fallback) {
  if (content && typeof content === "object" && content.type) {
    return content.type;
  }
  return fallback;
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
  const toast = useToast();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [status, setStatus] = useState(initialValues?.status ?? "draft");
  const [excerpt, setExcerpt] = useState(initialValues?.excerpt ?? "");
  const [contentText, setContentText] = useState(getContentText(initialValues?.content));
  const [contentFormat, setContentFormat] = useState(
    getContentType(initialValues?.content, mode === "create" ? "html" : "markdown"),
  );
  const [coverImageUrl, setCoverImageUrl] = useState(initialValues?.cover_image_url ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(initialValues?.youtube_url ?? "");
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
  const [tags, setTags] = useState([]);
  const [tagQuery, setTagQuery] = useState("");
  const [tagCreating, setTagCreating] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState(initialValues?.tag_ids ?? []);
  const [codeEditorOpen, setCodeEditorOpen] = useState(false);

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
    setContentFormat(getContentType(initialValues?.content, mode === "create" ? "html" : "markdown"));
    setCoverImageUrl(initialValues?.cover_image_url ?? "");
    setYoutubeUrl(initialValues?.youtube_url ?? "");
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
    setSelectedTagIds(initialValues?.tag_ids ?? []);
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

  useEffect(() => {
    let cancelled = false;
    listAllTags()
      .then((rows) => {
        if (cancelled) return;
        setTags(rows);
      })
      .catch(() => {
        if (cancelled) return;
        setTags([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);
  const tagQueryTrimmed = tagQuery.trim();
  const tagExists = useMemo(() => {
    if (!tagQueryTrimmed) return false;
    const queryLower = tagQueryTrimmed.toLowerCase();
    return tags.some(
      (tag) => tag.name.toLowerCase() === queryLower || tag.slug.toLowerCase() === slugify(tagQueryTrimmed),
    );
  }, [tagQueryTrimmed, tags]);
  const isHtmlContent = contentFormat === "html";
  const contentTextareaClassName = [
    "rounded-xl border px-3 py-2 outline-none transition-colors resize-y",
    "focus:border-[var(--color-500)]",
    "bg-transparent border-[var(--border-color)] text-[var(--text-color)]",
  ].join(" ");
  const editorWrapperClassName =
    "rounded-xl border border-[#30363d] bg-[#0d1117] shadow-inner overflow-hidden";

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
          content: contentText.trim() ? { type: contentFormat, body: contentText.trim() } : null,
          cover_image_url: coverImageUrl.trim() || null,
          youtube_url: youtubeUrl.trim() || null,
          category_id: categoryId ? Number(categoryId) : null,
          status,
          published_at: finalPublishedAt,
          seo_title: seoTitle.trim() || null,
          seo_description: seoDescription.trim() || null,
          canonical_url: canonicalUrl.trim() || null,
          no_index: Boolean(noIndex),
          tag_ids: selectedTagIds,
        });
      }}
    >
      <Modal
        open={codeEditorOpen}
        title="Editor HTML/CSS"
        onClose={() => setCodeEditorOpen(false)}
        maxWidthClassName="max-w-6xl"
      >
        <div className="rounded-2xl border border-[#30363d] bg-[#0d1117] shadow-inner overflow-hidden">
          <CodeMirror
            value={contentText}
            height="70vh"
            theme={vscodeDark}
            extensions={[html()]}
            onChange={(value) => setContentText(value)}
            basicSetup={{ lineNumbers: true, foldGutter: true }}
          />
        </div>
      </Modal>

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
          <label className="text-sm font-semibold text-[var(--subtle-text)]">Video URL (YouTube)</label>
          <input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          />
          <p className="text-xs text-[var(--subtle-text)]">Opcional. Se guarda como video relacionado del post.</p>
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

        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-[var(--subtle-text)]">Tags</label>
            <span className="text-xs text-[var(--subtle-text)]">
              {selectedTagIds.length} seleccionados
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedTagIds.length === 0 ? (
              <span className="text-xs text-[var(--subtle-text)]">Sin tags seleccionados.</span>
            ) : (
              tags
                .filter((tag) => selectedTagIds.includes(tag.id))
                .map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] px-3 py-1 text-xs font-semibold hover:border-[var(--color-500)] transition-colors"
                    onClick={() =>
                      setSelectedTagIds((prev) => prev.filter((id) => id !== tag.id))
                    }
                  >
                    #{tag.name}
                    <span className="text-[var(--subtle-text)]">×</span>
                  </button>
                ))
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr,auto] sm:items-center">
            <input
              value={tagQuery}
              onChange={(e) => setTagQuery(e.target.value)}
              placeholder="Buscar o crear tag…"
              className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
            />
            <button
              type="button"
              className="h-11 px-4 rounded-xl border border-[var(--border-color)] font-semibold hover:border-[var(--color-500)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={tagCreating || !tagQueryTrimmed || tagExists}
              onClick={async () => {
                const name = tagQueryTrimmed;
                if (!name) return;
                const slug = slugify(name);
                if (tagExists) return;
                try {
                  setTagCreating(true);
                  const created = await createTag({ name, slug });
                  setTags((prev) => [created, ...prev]);
                  setSelectedTagIds((prev) => [...new Set([...prev, created.id])]);
                  setTagQuery("");
                  toast.success("Tag creado.");
                } catch (err) {
                  toast.error(err?.message || "No se pudo crear el tag.");
                } finally {
                  setTagCreating(false);
                }
              }}
            >
              {tagCreating ? "Creando…" : "Crear tag"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags
              .filter((tag) => {
                if (!tagQuery.trim()) return true;
                const q = tagQuery.trim().toLowerCase();
                return tag.name.toLowerCase().includes(q) || tag.slug.toLowerCase().includes(q);
              })
              .map((tag) => {
                const active = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={[
                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                      active
                        ? "bg-[var(--color-500)] text-white"
                        : "border border-[var(--border-color)] hover:border-[var(--color-500)]",
                    ].join(" ")}
                    onClick={() =>
                      setSelectedTagIds((prev) =>
                        active ? prev.filter((id) => id !== tag.id) : [...prev, tag.id],
                      )
                    }
                  >
                    {tag.name}
                  </button>
                );
              })}
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:col-span-2">
          <label className="text-sm font-semibold text-[var(--subtle-text)]">Formato de contenido</label>
          <select
            value={contentFormat}
            onChange={(e) => setContentFormat(e.target.value)}
            className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
          >
            <option value="html">HTML/CSS</option>
            <option value="markdown">Markdown</option>
          </select>
          <p className="text-xs text-[var(--subtle-text)]">
            Puedes usar HTML y CSS (por ejemplo, incluir un <code>&lt;style&gt;</code>).
          </p>
        </div>

        <div className="flex flex-col gap-2 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-[var(--subtle-text)]">Contenido</label>
            {isHtmlContent ? (
              <button
                type="button"
                className="text-xs font-semibold rounded-full border border-[var(--border-color)] px-3 py-1 hover:border-[var(--color-500)] transition-colors"
                onClick={() => setCodeEditorOpen(true)}
              >
                Ver en grande
              </button>
            ) : null}
          </div>
          {isHtmlContent ? (
            <div className={editorWrapperClassName}>
              <CodeMirror
                value={contentText}
                height="320px"
                theme={vscodeDark}
                extensions={[html()]}
                onChange={(value) => setContentText(value)}
                basicSetup={{ lineNumbers: true, foldGutter: true }}
              />
            </div>
          ) : (
            <textarea
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              rows={12}
              placeholder="Contenido del art?culo (Markdown)?"
              className={contentTextareaClassName}
              spellCheck
            />
          )}
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

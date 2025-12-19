function getContentText(content) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (typeof content === "object") return content.body || content.text || content.markdown || "";
  return "";
}

function getContentType(content) {
  if (content && typeof content === "object" && content.type) return content.type;
  return "markdown";
}

function sanitizeHtml(html) {
  return String(html || "").replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
}

function looksLikeHtml(text) {
  return /<\/?[a-z][\s\S]*>/i.test(text || "");
}

function getYouTubeId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }
    if (parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname.split("/")[2] || "";
    }
    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname.split("/")[2] || "";
    }
    return parsed.searchParams.get("v") || "";
  } catch {
    return "";
  }
}

function getYouTubeEmbedUrl(url) {
  const id = getYouTubeId(url);
  if (!id) return "";
  return `https://www.youtube.com/embed/${id}`;
}

export function PostPreview({ post }) {
  const contentText = getContentText(post?.content);
  const tags = post?.post_tags?.map((item) => item?.tags?.name).filter(Boolean) ?? [];
  const contentType = getContentType(post?.content);
  const shouldRenderHtml = contentType === "html" || looksLikeHtml(contentText);
  const youtubeUrl = post?.youtube_url || post?.youtube_links?.[0]?.youtube_url || "";
  const youtubeEmbedUrl = getYouTubeEmbedUrl(youtubeUrl);

  return (
    <article className="flex flex-col gap-4">
      {post?.cover_image_url ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)]">
          <img
            src={post.cover_image_url}
            alt={post.title ? `Portada: ${post.title}` : "Portada del artículo"}
            className="w-full h-[220px] sm:h-[260px] object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <header className="flex flex-col gap-2">
        <p className="text-xs text-[var(--subtle-text)]">
          {post?.categories?.name ? post.categories.name : "Sin categoría"}
          {post?.published_at ? ` • Publicado: ${new Date(post.published_at).toLocaleDateString()}` : null}
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{post?.title ?? "Sin título"}</h1>
        <div className="flex flex-wrap gap-2">
          {tags.length === 0 ? (
            <span className="text-xs text-[var(--subtle-text)]">Sin tags</span>
          ) : (
            tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--border-color)] px-2 py-0.5 text-[11px] font-semibold"
              >
                #{tag}
              </span>
            ))
          )}
        </div>
        {post?.excerpt ? (
          <p className="text-[var(--subtle-text)] leading-relaxed">{post.excerpt}</p>
        ) : null}
      </header>

      {youtubeEmbedUrl ? (
        <section className="rounded-2xl border border-[var(--border-color)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)] overflow-hidden">
          <div className="aspect-video w-full">
            <iframe
              src={youtubeEmbedUrl}
              title="Video relacionado"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-[var(--border-color)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)] p-4">
        {contentText ? (
          shouldRenderHtml ? (
            <div
              className="text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentText) }}
            />
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{contentText}</div>
          )
        ) : (
          <p className="text-sm text-[var(--subtle-text)]">Sin contenido todavía.</p>
        )}
      </section>
    </article>
  );
}

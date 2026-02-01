export default function ViralSection({ tags, virales, listPosts, formatDate }) {
  const tagsList =
    tags && tags.length
      ? tags
      : ["Tecnología", "IA", "Ciberseguridad", "Gadgets"];
  const posts = virales && virales.length ? virales : listPosts.slice(0, 4);

  return (
    <>
      <div className="border border-[var(--border-color)] rounded-lg px-3 py-1 bg-[var(--color-500)] text-white backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2 text-sm uppercase tracking-wide">
          {tagsList.map((tag, idx, arr) => (
            <div key={`${tag}-${idx}`} className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-white">
                #{tag}
              </span>
              {idx < arr.length - 1 && <span className="text-white opacity-80">|</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="relative text-center py-6 overflow-hidden h-24 sm:h-28">
        <div
          className="pointer-events-none select-none absolute inset-0 opacity-50 flex items-center overflow-hidden"
          style={{
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)",
            maskImage:
              "linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)",
          }}
        >
          <div className="marquee-virales virales-marquee-color flex items-center text-[14vw] sm:text-[10vw] lg:text-[8vw] font-black leading-none w-full">
            {Array.from({ length: 12 }).map((_, idx) => (
              <span key={idx} className="mx-6 flex items-center gap-2">
                <span>VIRALES</span>
                <span className="text-[0.5em] sm:text-[0.6em] lg:text-[0.65em]">🔥</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        style={{ minWidth: "1314px", width: "100%", height: "100%" }}
      >
        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-lg border border-[var(--border-color)] bg-[rgba(255,255,255,0.03)] backdrop-blur-sm overflow-hidden shadow-sm"
          >
            <div className="w-full aspect-video bg-[rgba(255,255,255,0.04)] relative">
              {post.cover_image_url ? (
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[var(--subtle-text)] text-xs">
                  Sin imagen
                </div>
              )}
            </div>
            <div className="p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs uppercase text-[var(--subtle-text)]">
                {post.categories?.name && (
                  <span className="px-2 py-[2px] rounded-full bg-[rgba(255,255,255,0.08)] backdrop-blur-md border border-[var(--border-color)]">
                    {post.categories.name}
                  </span>
                )}
                {post.published_at && <span>{formatDate(post.published_at)}</span>}
              </div>
              <h3 className="text-base font-semibold leading-tight line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-sm text-[var(--subtle-text)] line-clamp-2">
                  {post.excerpt}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-2xl bg-[var(--color-500)] text-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.3em] opacity-80">
            El CódIgo de Hoy
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold">
            Noticias diarias de tecnología y TI
          </h3>
          <p className="text-sm sm:text-base text-white/90 ">
            Un blog moderno con análisis, tendencias y contenido curado para
            mantenerte al día. Explora artículos, tags y lo más viral del momento.
          </p>
        </div>
      </div>
    </>
  );
}

export default function FeaturedPost({
  lastPost,
  loading,
  error,
  formatDate,
  sidebarPosts = [],
}) {
  return (
    <>
      <div className="relative rounded-lg overflow-hidden min-h-[60vh]">
        {loading && <p className="text-[var(--subtle-text)] p-4">Cargando último post...</p>}
        {error && <p className="text-red-400 text-sm p-4">{error}</p>}
        {!loading && !error && !lastPost && (
          <p className="text-[var(--subtle-text)] p-4">Aún no hay publicaciones.</p>
        )}
        {lastPost && (
          <article className="relative w-full h-full rounded-md overflow-hidden">
            {lastPost.cover_image_url ? (
              <img
                src={lastPost.cover_image_url}
                alt={lastPost.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center text-[var(--subtle-text)] text-sm bg-[rgba(255,255,255,0.04)]">
                Sin imagen
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col gap-2 text-white drop-shadow-sm">
              <span className="text-xs uppercase tracking-[0.2em] opacity-85">Último post</span>
              <div className="flex items-center gap-3 flex-wrap">
                {lastPost.published_at && (
                  <span className="text-sm text-gray-200">{formatDate(lastPost.published_at)}</span>
                )}
                {lastPost.categories?.name && (
                  <span className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.1)] backdrop-blur-md border border-[var(--border-color)] text-sm font-semibold">
                    {lastPost.categories.name}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight">{lastPost.title}</h2>
              {lastPost.excerpt && <p className="text-base text-gray-100/90">{lastPost.excerpt}</p>}
            </div>
          </article>
        )}
      </div>

      <div className="rounded-lg grid grid-rows-6 gap-3 h-full mr-[14px]">
        {loading && <p className="text-[var(--subtle-text)] p-4">Cargando último post...</p>}
        {error && <p className="text-red-400 text-sm px-2">{error}</p>}
        {!loading &&
          !error &&
          sidebarPosts.map((post) => (
            <article
              key={post.id}
              className="flex items-center gap-4 rounded-md border border-[var(--border-color)] bg-[rgba(255,255,255,0.03)] backdrop-blur-sm p-4 h-full"
            >
              <div className="w-32 h-20 rounded-md overflow-hidden bg-[rgba(255,255,255,0.04)] border border-[var(--border-color)] flex-shrink-0">
                {post.cover_image_url ? (
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--subtle-text)] text-xs">
                    Sin imagen
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap text-xs uppercase text-[var(--subtle-text)]">
                  {post.categories?.name && (
                    <span className="px-2 py-[2px] rounded-full bg-[rgba(255,255,255,0.08)] backdrop-blur-md border border-[var(--border-color)]">
                      {post.categories.name}
                    </span>
                  )}
                  {post.published_at && (
                    <span className="text-[var(--subtle-text)] lowercase">
                      {formatDate(post.published_at)}
                    </span>
                  )}
                </div>
                <h3
                  className="text-sm font-semibold leading-snug text-[var(--text-color)]"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {post.title}
                </h3>
              </div>
            </article>
          ))}
      </div>
    </>
  );
}

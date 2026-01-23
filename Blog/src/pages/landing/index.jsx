import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import PublicHeader from "../../components/layout/PublicHeader";
import PublicNav from "../../components/layout/PublicNav";
import PublicFloatNav from "../../components/layout/PublicFloatNav";

const formatDate = (iso) =>
  new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

export default function LandingPage() {
  const [lastPost, setLastPost] = useState(null);
  const [listPosts, setListPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derivados para sección "Virales / Categorías"
  const categorias = useMemo(
    () =>
      Array.from(
        new Set(
          listPosts
            .map((p) => p.categories?.name)
            .filter((c) => typeof c === "string" && c.trim().length > 0),
        ),
      ),
    [listPosts],
  );

  const virales = useMemo(() => listPosts.slice(0, 4), [listPosts]);

  useEffect(() => {
    if (!supabase) {
      setError("Supabase no está configurado (revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY).");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const queries = [
        supabase
          .from("posts")
          .select("id,title,excerpt,cover_image_url,published_at,created_at,category_id,categories(name)")
          .eq("status", "published")
          .order("published_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .limit(1),
        supabase
          .from("posts")
          .select("id,title,excerpt,cover_image_url,published_at,created_at,category_id,categories(name)")
          .eq("status", "published")
          .order("published_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .limit(7),
      ];

      const [lastRes, listRes] = await Promise.all(queries);

      if (lastRes.error || listRes.error) {
        setError("No se pudo cargar el contenido.");
        setLastPost(null);
        setListPosts([]);
      } else {
        setLastPost(lastRes.data?.[0] ?? null);
        setListPosts(listRes.data ?? []);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const sidebarPosts = useMemo(() => {
    // Evita repetir el destacado
    const featuredId = lastPost?.id;
    return listPosts.filter((p) => p.id !== featuredId).slice(0, 6);
  }, [listPosts, lastPost]);

  return (
    <main className="relative min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex items-center">
      <div className="w-full flex flex-col gap-4 px-20 ">
        <PublicHeader />
        <PublicNav />
        <PublicFloatNav />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-[70%_30%] min-h-[70vh]">
          <div className="relative border-2 border-[var(--color-500)] rounded-lg p-1 overflow-hidden min-h-[60vh]">
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
                  {lastPost.excerpt && (
                    <p className="text-base text-gray-100/90">{lastPost.excerpt}</p>
                  )}
                </div>
              </article>
            )}
          </div>

          <div className="border-2 border-[var(--color-500)] rounded-lg p-2 grid grid-rows-6 gap-3 h-full">
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
        </section>

        {/* Sección Virales / Categorías */}
        <section className="mt-10 flex flex-col gap-6">
          <div className="border border-[var(--border-color)] rounded-lg px-4 py-2 bg-[var(--color-500)] text-white backdrop-blur-sm">
            <div className="flex flex-wrap gap-3 text-sm text-[var(--subtle-text)] uppercase tracking-wide">
              {(categorias.length ? categorias : ["Tecnología", "IA", "Ciberseguridad", "Gadgets"]).map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 rounded-full text-white"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold">VIRALES - VIRALES</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(virales.length ? virales : listPosts.slice(0, 4)).map((post) => (
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
                      <span className="px-2 py-[2px] rounded-full bg-[rgba(255,255,255,0.05)] border border-[var(--border-color)]">
                        {post.categories.name}
                      </span>
                    )}
                    {post.published_at && <span>{formatDate(post.published_at)}</span>}
                  </div>
                  <h3 className="text-base font-semibold leading-tight line-clamp-2">{post.title}</h3>
                  {post.excerpt && <p className="text-sm text-[var(--subtle-text)] line-clamp-2">{post.excerpt}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
















import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import PublicHeader from "../../components/layout/PublicHeader";
import PublicNav from "../../components/layout/PublicNav";
import PublicFloatNav from "../../components/layout/PublicFloatNav";
import FeaturedPost from "../../components/landing/FeaturedPost";
import ViralSection from "../../components/landing/ViralSection";
import CategoryFilterSection from "../../components/landing/CategoryFilterSection";
import LoginSection from "../../components/landing/LoginSection";
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

  // Derivados para sección "Virales / Tags"
  const tags = useMemo(
    () =>
      Array.from(
        new Set(
          listPosts
            .flatMap((p) => p.post_tags ?? [])
            .map((pt) => pt.tags?.name)
            .filter((t) => typeof t === "string" && t.trim().length > 0),
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
          .select(
            "id,title,excerpt,cover_image_url,published_at,created_at,category_id,categories(name),post_tags:post_tags(tags(name))",
          )
          .eq("status", "published")
          .order("published_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .limit(1),
        supabase
          .from("posts")
          .select(
            "id,title,excerpt,cover_image_url,published_at,created_at,category_id,categories(name),post_tags:post_tags(tags(name))",
          )
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
    <main className="relative min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex items-center overflow-hidden">
      <div className="w-full flex flex-col gap-4 px-20 relative z-10">
        <PublicHeader />
        <PublicNav />
        <PublicFloatNav />

        {/*
          ==========================
          SECCIÓN: DESTACADO + LISTADO
          ==========================
        */}
        <section
          className="grid grid-cols-1 gap-4 sm:grid-cols-[75%_25%] min-h-[70vh] w-full"
          style={{ height: "100%" }}
        >
          <FeaturedPost
            lastPost={lastPost}
            loading={loading}
            error={error}
            formatDate={formatDate}
            sidebarPosts={sidebarPosts}
          />
        </section>

        {/*
          ==========================
          SECCIÓN: VIRALES
          ==========================
        */}
        <section className="mt-10 flex flex-col gap-6">
          <ViralSection
            tags={tags}
            virales={virales}
            listPosts={listPosts}
            formatDate={formatDate}
          />
        </section>

        {/*
          ==========================
          SECCIÓN: FILTRO POR CATEGORÍA
          ==========================
        */}
        <section className="mt-10">
          <CategoryFilterSection posts={listPosts} formatDate={formatDate} />
        </section>

         {/*
          ==========================
          SECCIÓN: LOGIN
          ==========================
        */}
        <section class="mt-10">
          <LoginSection></LoginSection>
        </section>
      </div>
    </main>
  );
}
















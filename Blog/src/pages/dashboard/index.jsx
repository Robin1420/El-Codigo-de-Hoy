import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const formatNumber = (n) => {
  if (n === null || n === undefined) return "...";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
};

const todayIso = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const cardIcons = {
  Posts: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
      <circle cx="7" cy="6" r="1" />
      <circle cx="7" cy="12" r="1" />
      <circle cx="7" cy="18" r="1" />
    </svg>
  ),
  Publicados: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="m5 13 4 4L19 7" />
      <rect x="3" y="3" width="20" height="20" rx="2" ry="2" />
    </svg>
  ),
  Categorías: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 4h6v6H4z" />
      <path d="M14 4h6v6h-6z" />
      <path d="M4 14h6v6H4z" />
      <path d="M14 14h6v6h-6z" />
    </svg>
  ),
  Tags: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 7V3h4l14 14-4 4L3 7z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  ),
  Usuarios: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  Proyectos: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 7h18" />
      <path d="M3 12h18" />
      <path d="M3 17h18" />
      <path d="M7 3v4" />
      <path d="M12 3v4" />
      <path d="M17 3v4" />
    </svg>
  ),
  Experiencia: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v2" />
      <path d="M3 12h18" />
    </svg>
  ),
  Habilidades: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3" />
      <path d="M12 19v3" />
      <path d="m4.93 4.93 2.12 2.12" />
      <path d="m16.95 16.95 2.12 2.12" />
      <path d="M2 12h3" />
      <path d="M19 12h3" />
      <path d="m4.93 19.07 2.12-2.12" />
      <path d="m16.95 7.05 2.12-2.12" />
    </svg>
  ),
  Redes: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25A2.25 2.25 0 0 0 10.5 8.25V6A2.25 2.25 0 0 0 8.25 3.75H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
};

function Sparkline({ data = [], color = "var(--color-500)" }) {
  const w = 220;
  const h = 70;
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const norm = max === min ? data.map(() => h / 2) : data.map((v) => h - ((v - min) / (max - min)) * (h - 10) - 5);
  const step = w / Math.max(1, data.length - 1);
  const path = norm
    .map((y, i) => `${i === 0 ? "M" : "L"} ${Math.round(i * step)} ${Math.round(y)}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Bars({ data = [], labels = [] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-2">
      {data.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="w-8 rounded-full bg-[var(--panel-color)] border border-[var(--border-color)] overflow-hidden h-20 flex items-end">
            <div
              className="w-full bg-[var(--color-500)]"
              style={{ height: `${Math.min(100, Math.round((v / max) * 100))}%`, transition: "height 0.3s ease" }}
            />
          </div>
          <span className="text-[10px] text-[var(--subtle-text)]">{labels[i] || ""}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardHome() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({
    posts: null,
    published: null,
    categories: null,
    tags: null,
    users: null,
    projects: null,
    experience: null,
    skills: null,
    social: null,
    viewsTotal: null,
    viewsToday: null,
  });
  const [topPosts, setTopPosts] = useState([]);
  const [viewsDaily, setViewsDaily] = useState([]);
  const [recent, setRecent] = useState({ posts: [], projects: [] });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    setError(null);
    try {
      const today = todayIso();
      const since14d = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const [
        postsAll,
        postsPub,
        categories,
        tags,
        users,
        projects,
        experience,
        skills,
        social,
        viewsTotal,
        viewsToday,
        viewsWindow,
        postTitles,
        recentPosts,
        recentProjects,
      ] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("tags").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("portfolio_projects").select("id", { count: "exact", head: true }),
        supabase.from("portfolio_experience").select("id", { count: "exact", head: true }),
        supabase.from("portfolio_skills").select("id", { count: "exact", head: true }),
        supabase.from("portfolio_social_links").select("id", { count: "exact", head: true }),
        supabase.from("post_stats").select("id", { count: "exact", head: true }),
        supabase.from("post_stats").select("id", { count: "exact", head: true }).gte("visited_at", today),
        supabase
          .from("post_stats")
          .select("post_id, visited_at")
          .gte("visited_at", since14d)
          .limit(5000),
        supabase.from("posts").select("id, title"),
        supabase.from("posts").select("id, title, status, created_at").order("created_at", { ascending: false }).limit(5),
        supabase
          .from("portfolio_projects")
          .select("id, title, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const topMap = {};
      (viewsWindow.data ?? []).forEach((row) => {
        if (!row.post_id) return;
        topMap[row.post_id] = (topMap[row.post_id] || 0) + 1;
      });
      const titleMap = {};
      (postTitles.data ?? []).forEach((p) => {
        titleMap[p.id] = p.title || `Post ${p.id}`;
      });
      const topArr = Object.entries(topMap)
        .map(([post_id, views]) => ({ post_id, views, title: titleMap[post_id] || `Post ${post_id}` }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      const dailyMap = {};
      (viewsWindow.data ?? []).forEach((row) => {
        if (!row.visited_at) return;
        const key = row.visited_at.slice(0, 10);
        dailyMap[key] = (dailyMap[key] || 0) + 1;
      });
      const daysRange = Array.from({ length: 14 }).map((_, idx) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - idx));
        const key = d.toISOString().slice(0, 10);
        return { day: key, value: dailyMap[key] || 0 };
      });

      setCounts({
        posts: postsAll.count ?? 0,
        published: postsPub.count ?? 0,
        categories: categories.count ?? 0,
        tags: tags.count ?? 0,
        users: users.count ?? 0,
        projects: projects.count ?? 0,
        experience: experience.count ?? 0,
        skills: skills.count ?? 0,
        social: social.count ?? 0,
        viewsTotal: viewsTotal.count ?? 0,
        viewsToday: viewsToday.count ?? 0,
      });
      setTopPosts(topArr);
      setViewsDaily(daysRange);
      setRecent({
        posts: recentPosts.data ?? [],
        projects: recentProjects.data ?? [],
      });
    } catch (err) {
      setError("No se pudieron cargar las estadísticas.");
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    { label: "Posts", value: counts.posts },
    { label: "Publicados", value: counts.published },
    { label: "Categorías", value: counts.categories },
    { label: "Tags", value: counts.tags },
    { label: "Usuarios", value: counts.users },
    { label: "Proyectos", value: counts.projects },
    { label: "Experiencia", value: counts.experience },
    { label: "Habilidades", value: counts.skills },
    { label: "Redes", value: counts.social },
  ];

  const viewsBars = useMemo(() => {
    const total = counts.viewsTotal ?? 0;
    const today = counts.viewsToday ?? 0;
    const max = Math.max(total, today, 1);
    return [
      { label: "Vistas totales", value: total, pct: Math.min(100, Math.round((total / max) * 100)) },
      { label: "Vistas hoy", value: today, pct: Math.min(100, Math.round((today / max) * 100)) },
    ];
  }, [counts.viewsTotal, counts.viewsToday]);

  const sparkData = viewsDaily.length ? viewsDaily.map((d) => d.value) : [3, 6, 4, 7, 6, 9, 8, 12, 10, 14, 12, 16, 15, 18];
  const barData = topPosts.length ? topPosts.map((t) => t.views).slice(0, 5) : [4, 7, 6, 12, 8];
  const barLabels = topPosts.length ? topPosts.map((t) => t.title).slice(0, 5) : ["Lu", "Ma", "Mi", "Ju", "Vi"];

  return (
    <section className="flex flex-col gap-3">
      <div className="grid gap-3 lg:grid-cols-[2fr,1fr]">
        <div className="theme-surface bg-[var(--panel-color)] border border-[var(--border-color)] rounded-md p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <div className="flex items-center gap-2 text-xs text-[var(--subtle-text)]">
              <span className="px-3 py-1 rounded-full bg-[var(--border-color)]">Overview</span>
              <span className="px-3 py-1 rounded-full border border-[var(--border-color)]">Analytics</span>
            </div>
          </div>
          <p className="text-[var(--subtle-text)] mt-1">Resumen de contenido, portafolio y vistas.</p>
          {error ? (
            <div className="mt-2 rounded-md border border-[rgba(244,50,11,0.25)] bg-[rgba(244,50,11,0.08)] px-3 py-2 text-sm">
              {error}
            </div>
          ) : null}

          <div className="grid gap-2 mt-3 md:grid-cols-3">
            {cards.slice(0, 6).map((c) => (
              <div
                key={c.label}
                className="rounded-2xl border border-[var(--border-color)] bg-[var(--panel-color)] px-4 py-5 shadow-sm flex flex-col items-center text-center gap-2"
              >
                <div className="text-[var(--color-500)] flex items-center justify-center">{cardIcons[c.label] || null}</div>
                <span className="text-xs px-2 py-1 rounded-full bg-[rgba(244,50,11,0.12)] text-[var(--color-500)] border border-[rgba(244,50,11,0.3)] min-w-[36px] text-center">
                  {formatNumber(c.value)}
                </span>
                <p className="text-xs uppercase tracking-wide text-[var(--subtle-text)]">{c.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-md border border-[var(--border-color)] bg-[var(--panel-color)] p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Vistas recientes (14 días)</h3>
              <span className="text-sm text-[var(--subtle-text)]">post_stats</span>
            </div>
            <div className="overflow-hidden">
              <Sparkline data={sparkData} color="var(--color-500)" />
            </div>
          </div>
        </div>

        <div className="theme-surface bg-[var(--panel-color)] border border-[var(--border-color)] rounded-md p-4 shadow-sm">
          <h3 className="text-lg font-semibold">Conteos clave</h3>
          <div className="grid gap-2 mt-2">
            {cards.slice(6).map((c) => (
              <div
                key={c.label}
                className="flex items-center justify-between rounded-md border border-[var(--border-color)] px-3 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-500)]">{cardIcons[c.label] || null}</span>
                  <span className="text-sm text-[var(--subtle-text)]">{c.label}</span>
                </div>
                <span className="text-lg font-semibold text-[var(--text-color)]">{formatNumber(c.value)}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            {viewsBars.map((v) => (
              <div key={v.label} className="space-y-1">
                <div className="flex justify-between text-sm text-[var(--subtle-text)]">
                  <span>{v.label}</span>
                  <span className="font-semibold text-[var(--text-color)]">{formatNumber(v.value)}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--border-color)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-500)]"
                    style={{ width: `${v.pct}%`, transition: "width 0.3s ease" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gridAutoFlow: "dense" }}>
        <div className="theme-surface bg-[var(--panel-color)] border border-[var(--border-color)] rounded-md p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Top posts (14 días)</h3>
            <span className="text-sm text-[var(--subtle-text)]">post_stats</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {loading ? (
              <p className="text-[var(--subtle-text)] text-sm">Cargando...</p>
            ) : topPosts.length === 0 ? (
              <p className="text-[var(--subtle-text)] text-sm">Sin datos de vistas.</p>
            ) : (
              topPosts.map((t, idx) => (
                <div
                  key={t.post_id}
                  className="flex items-center justify-between rounded-md border border-[var(--border-color)] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-color)]">#{idx + 1}</span>
                    <span className="text-sm text-[var(--text-color)] truncate max-w-[180px]">{t.title}</span>
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-500)]">{t.views}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="theme-surface bg-[var(--panel-color)] border border-[var(--border-color)] rounded-md p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Actividad reciente - Posts</h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {loading ? (
              <p className="text-[var(--subtle-text)] text-sm">Cargando...</p>
            ) : recent.posts.length === 0 ? (
              <p className="text-[var(--subtle-text)] text-sm">Aún no hay posts.</p>
            ) : (
              recent.posts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-md border border-[var(--border-color)] px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-[var(--text-color)] truncate max-w-[220px]">{p.title || `Post ${p.id}`}</span>
                    <span className="text-xs text-[var(--subtle-text)]">
                      {p.status || "sin estado"} — {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-xs uppercase text-[var(--subtle-text)]">{p.status || "N/A"}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="theme-surface bg-[var(--panel-color)] border border-[var(--border-color)] rounded-md p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Actividad reciente - Portafolio</h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {loading ? (
              <p className="text-[var(--subtle-text)] text-sm">Cargando...</p>
            ) : recent.projects.length === 0 ? (
              <p className="text-[var(--subtle-text)] text-sm">Aún no hay proyectos.</p>
            ) : (
              recent.projects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-md border border-[var(--border-color)] px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-[var(--text-color)] truncate max-w-[220px]">{p.title || `Proyecto ${p.id}`}</span>
                    <span className="text-xs text-[var(--subtle-text)]">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="text-xs uppercase text-[var(--subtle-text)]">Proyecto</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

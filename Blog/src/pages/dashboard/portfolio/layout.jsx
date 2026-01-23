import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";

const tabs = [
  { label: "Proyectos", to: "/dashboard/portfolio/projects" },
  { label: "Experiencia", to: "/dashboard/portfolio/experience" },
  { label: "Habilidades", to: "/dashboard/portfolio/skills" },
  { label: "Redes", to: "/dashboard/portfolio/social" },
];

const cardIcons = {
  projects: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
  ),
  experience: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v2" />
      <path d="M3 12h18" />
    </svg>
  ),
  skills: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  ),
  social: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
};

export default function PortfolioLayout() {
  const [counts, setCounts] = useState({ projects: null, experience: null, skills: null, social: null });
  const [loadingCounts, setLoadingCounts] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadCounts() {
      setLoadingCounts(true);
      try {
        const responses = await Promise.all([
          supabase.from("portfolio_projects").select("id", { count: "exact", head: true }),
          supabase.from("portfolio_experience").select("id", { count: "exact", head: true }),
          supabase.from("portfolio_skills").select("id", { count: "exact", head: true }),
          supabase.from("portfolio_social_links").select("id", { count: "exact", head: true }),
        ]);
        if (!mounted) return;
        setCounts({
          projects: responses[0].count ?? 0,
          experience: responses[1].count ?? 0,
          skills: responses[2].count ?? 0,
          social: responses[3].count ?? 0,
        });
      } finally {
        if (mounted) setLoadingCounts(false);
      }
    }
    loadCounts();
    return () => {
      mounted = false;
    };
  }, []);

  const badge = (value) => (
    <span className="text-xs px-2 py-1 rounded-full bg-[rgba(244,50,11,0.12)] text-[var(--color-500)] border border-[rgba(244,50,11,0.3)] min-w-[36px] text-center">
      {value === null ? "..." : value}
    </span>
  );

  const navPills = tabs.map((tab) => (
    <NavLink
      key={tab.to}
      to={tab.to}
      className={({ isActive }) =>
        [
          "px-4 py-2 rounded-full text-sm font-semibold transition-all h-9 flex items-center",
          isActive ? "bg-[var(--color-500)] text-white shadow-sm" : "text-[var(--text-color)] hover:bg-[rgba(255,255,255,0.06)]",
        ].join(" ")
      }
    >
      {tab.label}
    </NavLink>
  ));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold">Portafolio</h2>
          <p className="text-[var(--subtle-text)]">Administra proyectos, experiencia, habilidades y redes sociales.</p>
        </div>

        <div className="flex justify-center md:justify-start">
          <div className="theme-surface inline-flex flex-wrap gap-2 bg-[var(--panel-color)] border border-[var(--border-color)] rounded-full py-0 shadow-sm h-11 items-center" style={{ paddingLeft: "4px", paddingRight: "4px" }}>
            {navPills}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            key: "projects",
            title: "Gestiona tus casos",
            label: "Proyectos",
            desc: "Lista, crea o edita proyectos destacados. Usa la pestaña superior para entrar al detalle.",
            count: loadingCounts ? null : counts.projects,
          },
          {
            key: "experience",
            title: "Trayectoria laboral",
            label: "Experiencia",
            desc: "Cronología de roles, empresas y periodos. Entra por la pestaña Experiencia.",
            count: loadingCounts ? null : counts.experience,
          },
          {
            key: "skills",
            title: "Stack y nivel",
            label: "Habilidades",
            desc: "Registra habilidades técnicas y blandas. Organiza y edita en la pestaña Habilidades.",
            count: loadingCounts ? null : counts.skills,
          },
          {
            key: "social",
            title: "Presencia digital",
            label: "Redes",
            desc: "Enlaces sociales y orden de aparición. Gestiona en la pestaña Redes.",
            count: loadingCounts ? null : counts.social,
          },
        ].map((card) => (
          <div
            key={card.key}
            className="theme-surface bg-[var(--panel-color)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm hover:border-[var(--color-500)] transition-colors"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="text-[var(--color-500)] w-14 h-14 flex items-center justify-center">{cardIcons[card.key]}</div>
              <div className="flex flex-col items-center gap-1">
                {badge(card.count)}
                <span className="text-xs uppercase tracking-wide text-[var(--subtle-text)]">{card.label}</span>
              </div>
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="text-sm text-[var(--subtle-text)] leading-relaxed">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Outlet />
    </div>
  );
}

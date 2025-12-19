import Header from "./Header";
import { useEffect, useMemo, useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { ThemeToggle } from "../ui/ThemeToggle.jsx";

const tabs = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Posts", to: "/dashboard/posts" },
  { label: "Categorías", to: "/dashboard/categories" },
  { label: "Tags", to: "/dashboard/tags" },
  { label: "Páginas", to: "/dashboard/pages" },
  { label: "Portfolio", to: "/dashboard/portfolio" },
  { label: "Usuarios", to: "/dashboard/users" },
];

export default function DashboardLayout({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  const closeMobileNav = () => setMobileNavOpen(false);

  useEffect(() => {
    closeMobileNav();
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeMobileNav();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileNavOpen]);

  const navPills = useMemo(
    () =>
      tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            [
              "px-4 py-2 rounded-full text-sm font-semibold transition-all h-9 flex items-center",
              isActive
                ? "bg-[var(--color-500)] text-white shadow-sm"
                : "text-[var(--text-color)] hover:bg-[rgba(255,255,255,0.06)]",
            ].join(" ")
          }
        >
          {tab.label}
        </NavLink>
      )),
    [],
  );

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-[background-color,color] duration-200 ease">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-4">
        <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3">
          <div className="md:hidden">
            <button
              type="button"
              aria-label="Abrir menú"
              aria-expanded={mobileNavOpen}
              className="theme-surface inline-flex items-center justify-center w-11 h-11 rounded-full bg-[var(--panel-color)] border border-[var(--border-color)] hover:border-[var(--color-500)] transition-colors shadow-sm"
              onClick={() => setMobileNavOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="hidden md:flex justify-center">
            <div
              className="theme-surface inline-flex flex-wrap gap-2 bg-[var(--panel-color)] border border-[var(--border-color)] rounded-full py-0 shadow-sm h-11 items-center"
              style={{ paddingLeft: "4px", paddingRight: "4px" }}
            >
              {navPills}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <ThemeToggle />
            <Header />
          </div>
        </div>

        {/* Navegación móvil (sidebar) */}
        <div className="md:hidden">
          <div
            className={[
              "fixed inset-0 z-40 transition-opacity duration-200",
              mobileNavOpen ? "opacity-100" : "opacity-0 pointer-events-none",
            ].join(" ")}
            aria-hidden={!mobileNavOpen}
            onClick={closeMobileNav}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <aside
            className={[
              "fixed z-50 inset-y-0 left-0 w-[280px] theme-surface bg-[var(--panel-color)] border-r border-[var(--border-color)] shadow-xl",
              "transition-transform duration-200 ease-out",
              mobileNavOpen ? "translate-x-0" : "-translate-x-full",
            ].join(" ")}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            <div className="h-16 px-4 flex items-center justify-between border-b border-[var(--border-color)]">
              <div className="flex flex-col leading-tight">
                <span className="text-xs tracking-[0.25em] uppercase text-[var(--subtle-text)]">Panel</span>
                <span className="text-sm font-semibold">Administración</span>
              </div>
              <button
                type="button"
                aria-label="Cerrar menú"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border-color)] hover:border-[var(--color-500)] transition-colors"
                onClick={closeMobileNav}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="p-3 flex flex-col gap-2">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  onClick={closeMobileNav}
                  className={({ isActive }) =>
                    [
                      "h-11 px-4 rounded-xl flex items-center font-semibold transition-colors border",
                      isActive
                        ? "bg-[var(--color-500)] text-white border-[var(--color-500)]"
                        : "bg-transparent border-[var(--border-color)] hover:border-[var(--color-500)]",
                    ].join(" ")
                  }
                >
                  {tab.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>

        <main className="min-h-[60vh] flex flex-col gap-4 transition-[color] duration-200 ease">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}


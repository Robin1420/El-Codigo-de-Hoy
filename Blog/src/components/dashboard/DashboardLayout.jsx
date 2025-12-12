import Header from "./Header";
import { Outlet, NavLink } from "react-router-dom";
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
  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-1 justify-start px-3">
            <div
              className="inline-flex flex-wrap gap-2 bg-[var(--panel-color)] border border-[var(--border-color)] rounded-full px-3 py-0 shadow-sm h-11 items-center min-w-[520px]"
              style={{
                paddingLeft: "3px",
                paddingRight: "3px",
              }}
            >
              {tabs.map((tab) => (
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
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <Header />
          </div>
        </div>

        <main className="bg-[var(--panel-color)] border border-[var(--border-color)] rounded-2xl p-6 min-h-[60vh] shadow-sm">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}

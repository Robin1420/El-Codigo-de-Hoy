import { NavLink } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const links = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Posts", to: "/dashboard/posts" },
  { label: "Categor\u00edas", to: "/dashboard/categories" },
  { label: "Tags", to: "/dashboard/tags" },
  { label: "Portfolio", to: "/dashboard/portfolio" },
  { label: "Usuarios", to: "/dashboard/users" },
  { label: "Configuraci\u00f3n", to: "/dashboard/settings" },
];

export default function Sidebar() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 min-h-screen bg-[#1f2026] text-white flex flex-col p-5 gap-6 border-r border-[rgba(255,255,255,0.08)]">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Panel</p>
        <h2 className="text-xl font-semibold">Administraci\u00f3n</h2>
      </div>

      <nav className="flex flex-col gap-2 text-sm font-medium">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              [
                "px-3 py-2 rounded-lg transition-colors",
                isActive ? "bg-[rgba(255,255,255,0.12)]" : "hover:bg-[rgba(255,255,255,0.06)]",
              ].join(" ")
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button
        className="mt-auto rounded-lg px-3 py-2 text-sm font-semibold bg-[#F4320B] hover:bg-[#C82909] transition-colors"
        onClick={handleLogout}
      >
        Cerrar sesi\u00f3n
      </button>
    </aside>
  );
}



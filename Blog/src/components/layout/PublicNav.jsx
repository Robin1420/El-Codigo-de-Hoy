import { useMemo } from "react";
import { NavLink } from "react-router-dom";

const links = [
  { label: "Inicio", to: "/" },
  { label: "Lo último", to: "/lo-ultimo" },
  { label: "Tendencias", to: "/tendencias" },
  { label: "Noticias", to: "/blog" },
  { label: "Bytezon", to: "/bytezon" },
];

export default function PublicNav() {
  const items = useMemo(
    () =>
      links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/"}
          className={({ isActive }) =>
            [
              "px-4 py-2 rounded-full text-sm font-semibold transition-all h-9 flex items-center",
              isActive
                ? "bg-[var(--color-500)] text-white shadow-sm"
                : "text-[var(--text-color)] hover:bg-[rgba(255,255,255,0.06)]",
            ].join(" ")
          }
        >
          {link.label}
        </NavLink>
      )),
    [],
  );

  return (
    <nav className="w-full flex justify-center px-4 sm:px-2" aria-label="Navegación principal">
      <div className="theme-surface inline-flex flex-wrap gap-2 bg-[rgba(255,255,255,0.06)] backdrop-blur-md border border-[var(--border-color)] rounded-full py-0 shadow-sm h-11 items-center px-1">
        {items}
      </div>
    </nav>
  );
}

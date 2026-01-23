import { useNavigate } from "react-router-dom";

export default function PublicFloatNav() {
  const navigate = useNavigate();
  const items = [
    { label: "Cuenta", icon: UserIcon, href: "/login" },
    // { label: "Menú", icon: MenuIcon },
    { label: "Buscar", icon: SearchIcon },
    // { label: "Atajos", icon: BoltIcon },
    // { label: "Carrito", icon: CartIcon, badge: 0 },
  ];

  return (
    <nav
      className="fixed right-4 top-64 z-40 flex flex-col gap-3"
      aria-label="Accesos rápidos"
    >
      {items.map(({ label, icon: Icon, badge, href }) => (
        <button
          key={label}
          type="button"
          className="relative w-12 h-12 rounded-full bg-[rgba(255,255,255,0.06)] backdrop-blur-md border border-[var(--border-color)] text-[var(--text-color)] flex items-center justify-center shadow-sm hover:border-[var(--color-500)] transition-colors"
          onClick={() => href && navigate(href)}
          aria-label={label}
        >
          <Icon />
          {typeof badge === "number" && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-500)] text-white text-[11px] font-semibold flex items-center justify-center">
              {badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm-8 8a8 8 0 0 1 16 0" />
    </svg>
  );
}

// function MenuIcon() {
//   return (
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M4 7h16M4 12h16M4 17h16" />
//     </svg>
//   );
// }

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="6" />
      <path d="m16.5 16.5 3.5 3.5" />
    </svg>
  );
}

// function BoltIcon() {
//   return (
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M13 2 3 14h9l-1 8 10-12h-9Z" />
//     </svg>
//   );
// }

// function CartIcon() {
//   return (
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//       <circle cx="9" cy="20" r="1.5" />
//       <circle cx="18" cy="20" r="1.5" />
//       <path d="M3 4h2l2 12h11l2-8H7.5" />
//     </svg>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function Header() {
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, role")
        .eq("id", user.id)
        .single();

      if (!error && data) setProfile(data);
    };

    fetchProfile();
  }, []);

  return (
    <header className="flex justify-end relative z-50">
      {profile && (
        <div className="relative z-50" ref={menuRef}>
          <button
            aria-label="Abrir menú de usuario"
            className="inline-flex items-center gap-3 rounded-full h-11 bg-[var(--panel-color)] border border-[var(--border-color)] hover:border-[var(--color-500)] transition-colors shadow-sm min-w-[120px] px-3"
            style={{ paddingLeft: "1.5px", paddingRight: "1.5px" }}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[var(--border-color)] bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)]">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[var(--subtle-text)]">
                  User
                </div>
              )}
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-semibold text-[var(--text-color)] truncate">
                {profile.full_name || "Usuario"}
              </p>
              <p className="text-xs text-[var(--subtle-text)] truncate">{profile.role}</p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--subtle-text)]"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-50 w-52 rounded-xl border border-[var(--border-color)] bg-[var(--panel-color)] shadow-lg p-2 flex flex-col gap-1">
              <Link
                to="/dashboard/settings"
                className="px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-sm font-semibold transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Configuración
              </Link>
              <button
                className="text-left px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-sm font-semibold transition-colors"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

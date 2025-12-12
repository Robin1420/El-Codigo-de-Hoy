import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../../features/auth/components/AuthForm.jsx";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabaseClient";
import { ThemeToggle } from "../../components/ui/ThemeToggle.jsx";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkingRole, setCheckingRole] = useState(false);

  useEffect(() => {
    let active = true;
    const checkAdmin = async () => {
      if (!user) return;
      setCheckingRole(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!active) return;
      const role = !error ? data?.role?.trim().toLowerCase() : null;
      setCheckingRole(false);
      if (role === "admin") {
        navigate("/dashboard", { replace: true });
      }
    };
    checkAdmin();
    return () => {
      active = false;
    };
  }, [user, navigate]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--subtle-text)]">
            El Código de Hoy
          </p>
          <h1 className="text-3xl font-semibold text-[var(--text-color)]">
            Noticias diarias de tecnología y TI
          </h1>
          <p className="text-sm text-[var(--subtle-text)] max-w-2xl">
            Plataforma profesional con autenticación y panel para publicar contenido automatizado y curado.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <section className="grid place-items-center">
        {checkingRole && (
          <p className="text-sm text-[var(--subtle-text)] mb-2">Verificando rol...</p>
        )}
        <AuthForm />
      </section>
    </div>
  );
}

import { useMemo } from "react";
import AuthForm from "./features/auth/components/AuthForm.jsx";
import { ThemeToggle } from "./components/ui/ThemeToggle.jsx";

function App() {
  const bgStyle = useMemo(
    () => ({
      backgroundColor: "var(--bg-color)",
    }),
    [],
  );

  return (
    <main className="min-h-screen text-slate-900 dark:text-slate-100" style={bgStyle}>
      <ThemeToggle style={{ position: "fixed", top: "10px", right: "10px", zIndex: 50 }} />

      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
        </header>

        <section className="grid place-items-center">
          <AuthForm />
        </section>
      </div>
    </main>
  );
}

export default App;

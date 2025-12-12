import { useMemo } from "react";
import { AppRoutes } from "./app/routes.jsx";

function App() {
  const bgStyle = useMemo(
    () => ({
      backgroundColor: "var(--bg-color)",
    }),
    [],
  );

  return (
    <main className="min-h-screen text-slate-900 dark:text-slate-100" style={bgStyle}>
      <AppRoutes />
    </main>
  );
}

export default App;

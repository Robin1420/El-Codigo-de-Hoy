import { Outlet, Link, useLocation } from "react-router-dom";
import { PagesList } from "../../../features/pages/components/PagesList";

export default function PagesLayout() {
  const location = useLocation();
  const onNew = location.pathname.endsWith("/pages/new");
  const onEdit = location.pathname.includes("/pages/") && location.pathname.endsWith("/edit");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Páginas</h2>
          <p className="text-[var(--subtle-text)]">Crea y administra páginas estáticas.</p>
        </div>

        <Link
          to="/dashboard/pages/new"
          className={[
            "inline-flex items-center justify-center rounded-xl px-4 h-11 font-semibold transition-colors",
            "w-full sm:w-auto",
            "border border-[var(--border-color)] shadow-sm",
            onNew || onEdit
              ? "bg-[rgba(255,255,255,0.06)]"
              : "bg-[var(--color-500)] text-white hover:bg-[var(--color-600)] border-[var(--color-500)]",
          ].join(" ")}
        >
          Nueva página
        </Link>
      </div>

      <PagesList />

      {/* Modal (crear/editar) montado por rutas hijas */}
      <Outlet />
    </div>
  );
}
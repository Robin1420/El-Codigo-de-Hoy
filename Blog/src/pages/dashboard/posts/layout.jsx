import { Outlet, Link, useLocation } from "react-router-dom";
import { PostsList } from "../../../features/posts/components/PostsList";

export default function PostsLayout() {
  const location = useLocation();
  const onNew = location.pathname.endsWith("/posts/new");
  const onEdit = location.pathname.includes("/posts/") && location.pathname.endsWith("/edit");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Artículos</h2>
          <p className="text-[var(--subtle-text)]">Listado, creación y edición de artículos.</p>
        </div>

        <Link
          to="/dashboard/posts/new"
          className={[
            "inline-flex items-center justify-center rounded-xl px-4 h-11 font-semibold transition-colors",
            "w-full sm:w-auto",
            "border border-[var(--border-color)] shadow-sm",
            onNew || onEdit
              ? "bg-[rgba(255,255,255,0.06)]"
              : "bg-[var(--color-500)] text-white hover:bg-[var(--color-600)] border-[var(--color-500)]",
          ].join(" ")}
        >
          Nuevo artículo
        </Link>
      </div>

      <PostsList />

      {/* Modal (crear/editar) montado por rutas hijas */}
      <Outlet />
    </div>
  );
}

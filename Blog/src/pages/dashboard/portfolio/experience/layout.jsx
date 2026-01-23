import { Outlet, Link } from "react-router-dom";
import { ExperienceList } from "../../../../features/portfolio/components/ExperienceList";

export default function PortfolioExperienceLayout() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Experiencia</h3>
          <p className="text-[var(--subtle-text)]">Registra tu trayectoria laboral y roles clave.</p>
        </div>

        <Link
          to="/dashboard/portfolio/experience/new"
          className={[
            "inline-flex items-center justify-center rounded-xl px-4 h-11 font-semibold transition-colors",
            "w-full sm:w-auto",
            "border border-[var(--color-500)]",
            "bg-[var(--color-500)] text-white hover:bg-[var(--color-600)]",
          ].join(" ")}
        >
          Nueva experiencia
        </Link>
      </div>

      <ExperienceList />
      <Outlet />
    </div>
  );
}

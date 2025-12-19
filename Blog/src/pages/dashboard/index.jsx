export default function DashboardHome() {
  return (
    <section className="theme-surface bg-[var(--panel-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Bienvenido al Panel de Control</h2>
        <p className="text-[var(--subtle-text)]">
          Aquív podrás administrar tus posts, categorías, páginas y tu portfolio. (Espacio reservado para métricas y
          bienvenida, se implementará después).
        </p>
      </div>
    </section>
  );
}


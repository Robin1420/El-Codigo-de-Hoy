export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <section className="theme-surface bg-[var(--panel-color)] rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold">Configuración de mi cuenta</h2>
        <p className="text-[var(--subtle-text)]">
          Ajusta tus datos personales, seguridad y preferencias de sesión. (Contenido pendiente de implementar).
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="theme-surface bg-[var(--panel-color)] rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Perfil</h3>
          <p className="text-[var(--subtle-text)] text-sm">
            Nombre, correo y avatar. (Formulario pendiente de implementación).
          </p>
        </section>

        <section className="theme-surface bg-[var(--panel-color)] rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Seguridad</h3>
          <p className="text-[var(--subtle-text)] text-sm">
            Cambiar contraseña, 2FA, sesiones activas. (Se implementará más adelante).
          </p>
        </section>
      </div>
    </div>
  );
}


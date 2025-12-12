export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Configuración de mi cuenta</h2>
        <p className="text-[var(--subtle-text)]">
          Ajusta tus datos personales, seguridad y preferencias de sesión. (Contenido pendiente de implementar).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--panel-color)] shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Perfil</h3>
          <p className="text-[var(--subtle-text)] text-sm">
            Nombre, correo y avatar. (Formulario pendiente de implementación).
          </p>
        </section>

        <section className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--panel-color)] shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Seguridad</h3>
          <p className="text-[var(--subtle-text)] text-sm">
            Cambiar contraseña, 2FA, sesiones activas. (Se implementará más adelante).
          </p>
        </section>
      </div>
    </div>
  );
}

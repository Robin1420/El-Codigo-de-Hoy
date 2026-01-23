import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const roles = ["admin", "editor", "viewer"];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role, created_at, updated_at")
      .order("created_at", { ascending: false });
    if (err) {
      setError("No se pudo cargar usuarios.");
    } else {
      setUsers(data ?? []);
    }
    setLoading(false);
  }

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const term = search.trim().toLowerCase();
      const matchesText =
        !term ||
        (u.full_name ?? "").toLowerCase().includes(term) ||
        (u.id ?? "").toLowerCase().includes(term);
      const matchesRole = roleFilter === "todos" || u.role === roleFilter;
      return matchesText && matchesRole;
    });
  }, [users, search, roleFilter]);

  const startEdit = (u) => {
    setEditing({ ...u, role: u.role ?? "editor" });
  };

  const closeEdit = () => {
    setEditing(null);
    setSaving(false);
  };

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    const { error: err } = await supabase
      .from("profiles")
      .update({ full_name: editing.full_name ?? null, role: editing.role })
      .eq("id", editing.id);
    if (err) {
      setError("No se pudo actualizar el usuario.");
    } else {
      closeEdit();
      loadUsers();
    }
    setSaving(false);
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="theme-surface bg-[var(--panel-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold">Usuarios</h2>
        <p className="text-[var(--subtle-text)]">Gestiona perfiles, roles y datos básicos.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr,200px]">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[var(--subtle-text)]">Buscar</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre o correo..."
              className="h-11 rounded-xl border border-[var(--border-color)] bg-[var(--panel-color)] px-3 text-[var(--text-color)] focus:border-[var(--color-500)] outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[var(--subtle-text)]">Rol</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-11 rounded-xl border border-[var(--border-color)] bg-[var(--panel-color)] px-3 text-[var(--text-color)] focus:border-[var(--color-500)] outline-none"
            >
              <option value="todos">Todos</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-[rgba(244,50,11,0.3)] bg-[rgba(244,50,11,0.08)] px-4 py-3 text-[var(--text-color)]">
            {error}
          </div>
        ) : null}

        <div className="mt-4 rounded-2xl border border-[var(--border-color)]">
          <div className="grid grid-cols-[2fr,2fr,1fr,1fr] gap-2 px-4 py-3 text-sm text-[var(--subtle-text)]">
            <span>Nombre</span>
            <span>Correo</span>
            <span>Rol</span>
            <span className="text-right">Acciones</span>
          </div>
          <div className="divide-y divide-[var(--border-color)]">
            {loading ? (
              <div className="px-4 py-6 text-center text-[var(--subtle-text)]">Cargando...</div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-[var(--subtle-text)]">No hay usuarios.</div>
            ) : (
              filtered.map((u) => (
                <div key={u.id} className="grid grid-cols-[2fr,2fr,1fr,1fr] gap-2 px-4 py-4 items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--border-color)] overflow-hidden flex items-center justify-center text-sm font-semibold text-[var(--text-color)]">
                      {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : (u.full_name ?? u.id ?? "").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[var(--text-color)]">{u.full_name || "Sin nombre"}</span>
                      <span className="text-xs text-[var(--subtle-text)]">ID: {u.id}</span>
                    </div>
                  </div>
                  <div className="text-[var(--text-color)]">No disponible</div>
                  <div>
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[rgba(244,50,11,0.1)] text-[var(--color-500)] border border-[rgba(244,50,11,0.3)]">
                      {u.role || "editor"}
                    </span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      className="h-9 px-3 rounded-lg border border-[var(--border-color)] hover:border-[var(--color-500)] text-sm font-semibold"
                      onClick={() => startEdit(u)}
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.45)] backdrop-blur-sm">
          <div className="theme-surface bg-[var(--panel-color)] border border-[var(--border-color)] rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-xl font-semibold mb-2">Editar usuario</h3>
            <p className="text-sm text-[var(--subtle-text)] mb-4">{editing.id}</p>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[var(--subtle-text)]">Nombre</label>
                <input
                  type="text"
                  value={editing.full_name ?? ""}
                  onChange={(e) => setEditing({ ...editing, full_name: e.target.value })}
                  className="h-11 rounded-xl border border-[var(--border-color)] bg-[var(--panel-color)] px-3 text-[var(--text-color)] focus:border-[var(--color-500)] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-[var(--subtle-text)]">Rol</label>
                <select
                  value={editing.role ?? "editor"}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                  className="h-11 rounded-xl border border-[var(--border-color)] bg-[var(--panel-color)] px-3 text-[var(--text-color)] focus:border-[var(--color-500)] outline-none"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                className="h-10 px-4 rounded-lg border border-[var(--border-color)] text-sm font-semibold hover:border-[var(--color-500)]"
                onClick={closeEdit}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                className="h-10 px-4 rounded-lg text-sm font-semibold bg-[var(--color-500)] text-white hover:bg-[var(--color-600)]"
                onClick={saveEdit}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

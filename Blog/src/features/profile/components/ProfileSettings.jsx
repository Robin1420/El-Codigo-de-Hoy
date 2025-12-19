import { useEffect, useMemo, useState } from "react";
import fondoPerfil from "../../../assets/Fondo_Perfil.svg";
import { useToast } from "../../../components/ui/ToastProvider";
import { FullScreenLoader } from "../../../components/ui/FullScreenLoader";
import { getChangedFields } from "../../../lib/patch";
import {
  AVATAR_BUCKET,
  MAX_AVATAR_MB,
  fetchProfile,
  getCurrentUser,
  updateProfile,
  uploadAvatar,
} from "../services/profileService";

export function ProfileSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [snapshot, setSnapshot] = useState({ fullName: "", avatarUrl: "" });

  const formatDate = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return "—";
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const user = await getCurrentUser();
        if (!active) return;
        setUserId(user.id);
        setUserEmail(user.email || "");

        const profile = await fetchProfile(user.id);
        if (!active) return;
        setRole(profile?.role || "");
        setFullName(profile?.full_name || "");
        setAvatarUrl(profile?.avatar_url || "");
        setCreatedAt(profile?.created_at || "");
        setUpdatedAt(profile?.updated_at || "");
        setSnapshot({
          fullName: profile?.full_name || "",
          avatarUrl: profile?.avatar_url || "",
        });
      } catch (err) {
        if (!active) return;
        setError(err?.message || "No se pudo cargar el perfil.");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const isDirty = useMemo(
    () => fullName.trim() !== snapshot.fullName || avatarUrl.trim() !== snapshot.avatarUrl,
    [fullName, avatarUrl, snapshot.fullName, snapshot.avatarUrl],
  );
  const canSave = useMemo(
    () => fullName.trim().length > 0 && !saving && isDirty,
    [fullName, saving, isDirty],
  );

  const handleSave = async () => {
    if (!userId || !canSave) return;
    try {
      const patch = getChangedFields(
        { full_name: fullName.trim(), avatar_url: avatarUrl.trim() || null },
        { full_name: snapshot.fullName, avatar_url: snapshot.avatarUrl },
      );
      if (Object.keys(patch).length === 0) {
        toast.info("No hay cambios para guardar.");
        return;
      }
      setSaving(true);
      setError("");
      const updated = await updateProfile(userId, patch);
      setRole(updated?.role || role);
      setAvatarUrl(updated?.avatar_url || "");
      setFullName(updated?.full_name || "");
      setCreatedAt(updated?.created_at || createdAt);
      setUpdatedAt(updated?.updated_at || updatedAt);
      setSnapshot({
        fullName: updated?.full_name || "",
        avatarUrl: updated?.avatar_url || "",
      });
      toast.success("Perfil actualizado.");
    } catch (err) {
      setError(err?.message || "No se pudo actualizar el perfil.");
      toast.error(err?.message || "No se pudo actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFullName(snapshot.fullName || "");
    setAvatarUrl(snapshot.avatarUrl || "");
    setUploadError("");
    setError("");
  };

  const handleUpload = async (file) => {
    if (!file || !userId) return;

    if (!file.type?.startsWith("image/")) {
      setUploadError("Selecciona un archivo de imagen (PNG/JPG/WebP).");
      return;
    }

    const maxBytes = MAX_AVATAR_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`La imagen es muy pesada. Máximo ${MAX_AVATAR_MB}MB.`);
      return;
    }

    setUploadError("");
    setUploading(true);
    try {
      const url = await uploadAvatar(userId, file);
      setAvatarUrl(url);
      toast.success("Avatar actualizado.");
    } catch (err) {
      setUploadError(err?.message || "No se pudo subir el avatar.");
      toast.error(err?.message || "No se pudo subir el avatar.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <FullScreenLoader fullScreen={false} label="Cargando perfil" minHeightClassName="min-h-[60vh]" />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <section className="rounded-2xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] px-4 py-3">
          <p className="text-sm font-semibold text-[rgba(248,113,113,0.95)]">{error}</p>
        </section>
      ) : null}

      <section className="theme-surface bg-[var(--panel-color)] rounded-3xl p-6 shadow-sm">
        <div className="relative">
          <div
            className="relative h-[140px] sm:h-[170px] rounded-2xl overflow-hidden bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${fondoPerfil})`,
              backgroundSize: "105% 105%",
              backgroundPosition: "center",
              backgroundColor: "#0b0b0d",
            }}
          />

          <div className="absolute -bottom-10 left-6 rounded-full p-1.5 bg-[var(--panel-color)] shadow-lg">
            <div className="w-[96px] h-[96px] rounded-full overflow-hidden border border-[var(--border-color)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)]">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName ? `Avatar de ${fullName}` : "Avatar de usuario"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-[var(--subtle-text)]">
                  Sin avatar
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-12 flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold">{fullName || "Usuario"}</h2>
              <p className="text-sm text-[var(--subtle-text)]">{userEmail || "Sin correo"}</p>
              <div className="inline-flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold border border-[var(--border-color)] bg-[rgba(255,255,255,0.06)]">
                  {role || "editor"}
                </span>
                <span className="text-xs text-[var(--subtle-text)]">ID: {userId.slice(0, 8)}…</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label
                className={[
                  "h-11 px-4 rounded-xl font-semibold transition-colors shadow-sm cursor-pointer select-none",
                  "inline-flex items-center justify-center text-center leading-none",
                  "border border-[var(--color-500)]",
                  uploading
                    ? "opacity-70 cursor-not-allowed bg-[var(--color-500)] text-white"
                    : "bg-[var(--color-500)] text-white hover:bg-[var(--color-600)]",
                ].join(" ")}
              >
                {uploading ? "Subiendo…" : "Subir avatar"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    handleUpload(file);
                  }}
                />
              </label>
              {avatarUrl ? (
                <button
                  type="button"
                  className="h-11 px-4 rounded-xl border border-[var(--border-color)] font-semibold hover:border-[var(--color-500)] transition-colors"
                  onClick={() => setAvatarUrl("")}
                  disabled={uploading}
                >
                  Quitar
                </button>
              ) : null}
            </div>
          </div>

          {uploadError ? (
            <div className="rounded-xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] px-4 py-3">
              <p className="text-sm font-semibold text-[rgba(248,113,113,0.95)]">{uploadError}</p>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[rgba(255,255,255,0.03)] p-3">
              <p className="text-xs text-[var(--subtle-text)]">Cuenta creada</p>
              <p className="text-sm font-semibold">{formatDate(createdAt)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border-color)] bg-[rgba(255,255,255,0.03)] p-3">
              <p className="text-xs text-[var(--subtle-text)]">Última actualización</p>
              <p className="text-sm font-semibold">{formatDate(updatedAt)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border-color)] bg-[rgba(255,255,255,0.03)] p-3">
              <p className="text-xs text-[var(--subtle-text)]">Estado</p>
              <p className="text-sm font-semibold">Activo</p>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-[180px,1fr] sm:items-center">
              <label className="text-sm font-semibold text-[var(--subtle-text)]">Nombre completo</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre completo…"
                className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-[180px,1fr] sm:items-center">
              <label className="text-sm font-semibold text-[var(--subtle-text)]">Correo</label>
              <input
                value={userEmail}
                readOnly
                className="h-11 rounded-xl border border-[var(--border-color)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)] px-3 text-[var(--subtle-text)]"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-[180px,1fr] sm:items-center">
              <label className="text-sm font-semibold text-[var(--subtle-text)]">Rol</label>
              <input
                value={role || "editor"}
                readOnly
                className="h-11 rounded-xl border border-[var(--border-color)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.03)] px-3 text-[var(--subtle-text)]"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-[180px,1fr] sm:items-center">
              <label className="text-sm font-semibold text-[var(--subtle-text)]">URL del avatar</label>
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
                className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
              />
            </div>

            <p className="text-xs text-[var(--subtle-text)]">
              Puedes pegar una URL o subir una imagen al bucket <code>{AVATAR_BUCKET}</code>. Máximo {MAX_AVATAR_MB}MB.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty || saving}
              className="h-11 px-4 rounded-xl border border-[var(--border-color)] font-semibold hover:border-[var(--color-500)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className={[
                "h-11 px-4 rounded-xl font-semibold transition-colors shadow-sm",
                "border border-[var(--color-500)]",
                !canSave
                  ? "opacity-60 cursor-not-allowed bg-[var(--color-500)] text-white"
                  : "bg-[var(--color-500)] text-white hover:bg-[var(--color-600)]",
              ].join(" ")}
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

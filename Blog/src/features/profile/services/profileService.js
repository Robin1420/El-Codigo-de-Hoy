import { supabase } from "../../../lib/supabaseClient";

export const AVATAR_BUCKET = "avatars";
export const MAX_AVATAR_MB = 5;

function safeFileExt(name) {
  const parts = String(name || "").split(".");
  const ext = parts.length > 1 ? parts[parts.length - 1] : "";
  return ext.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
}

function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("No hay sesión activa.");
  return user;
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, created_at, updated_at")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, payload) {
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select("id, full_name, avatar_url, role, created_at, updated_at")
    .single();
  if (error) throw error;
  return data;
}

export async function uploadAvatar(userId, file) {
  const ext = safeFileExt(file?.name) || "png";
  const filePath = `profiles/${userId}/${randomId()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(filePath, file, {
    upsert: true,
    contentType: file.type,
    cacheControl: "3600",
  });

  if (uploadError) {
    if (String(uploadError.message || "").toLowerCase().includes("bucket")) {
      throw new Error(`No existe el bucket "${AVATAR_BUCKET}". Créalo en Supabase Storage (público).`);
    }
    throw uploadError;
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error("No se pudo obtener la URL pública del avatar.");
  return data.publicUrl;
}


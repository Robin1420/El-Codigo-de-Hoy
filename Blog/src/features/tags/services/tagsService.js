import { supabase } from "../../../lib/supabaseClient";

// Opcional: define `VITE_TAGS_TABLE` en `.env` si tu tabla no se llama `tags`.
const TAGS_TABLE = import.meta.env.VITE_TAGS_TABLE || "tags";

export async function listTags({ page = 1, pageSize = 10, query = "" } = {}) {
  const from = Math.max(0, (page - 1) * pageSize);
  const to = from + pageSize - 1;

  let request = supabase
    .from(TAGS_TABLE)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query) {
    request = request.or(`name.ilike.%${query}%,slug.ilike.%${query}%`);
  }

  const { data, error, count } = await request;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function getTagById(tagId) {
  const { data, error } = await supabase.from(TAGS_TABLE).select("*").eq("id", tagId).single();
  if (error) throw error;
  return data;
}

export async function createTag(payload) {
  const { data, error } = await supabase.from(TAGS_TABLE).insert(payload).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateTag(tagId, payload) {
  const { data, error } = await supabase.from(TAGS_TABLE).update(payload).eq("id", tagId).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteTag(tagId) {
  const { error } = await supabase.from(TAGS_TABLE).delete().eq("id", tagId);
  if (error) throw error;
}

export async function listAllTags() {
  const { data, error } = await supabase
    .from(TAGS_TABLE)
    .select("id, name, slug")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

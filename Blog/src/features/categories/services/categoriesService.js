import { supabase } from "../../../lib/supabaseClient";

// Opcional: define `VITE_CATEGORIES_TABLE` en `.env` si tu tabla no se llama `categories`.
const CATEGORIES_TABLE = import.meta.env.VITE_CATEGORIES_TABLE || "categories";

export async function listCategories({ page = 1, pageSize = 10, query = "" } = {}) {
  const from = Math.max(0, (page - 1) * pageSize);
  const to = from + pageSize - 1;

  let request = supabase
    .from(CATEGORIES_TABLE)
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

export async function getCategoryById(categoryId) {
  const { data, error } = await supabase
    .from(CATEGORIES_TABLE)
    .select("*")
    .eq("id", categoryId)
    .single();
  if (error) throw error;
  return data;
}

export async function createCategory(payload) {
  const { data, error } = await supabase.from(CATEGORIES_TABLE).insert(payload).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateCategory(categoryId, payload) {
  const { data, error } = await supabase
    .from(CATEGORIES_TABLE)
    .update(payload)
    .eq("id", categoryId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(categoryId) {
  const { error } = await supabase.from(CATEGORIES_TABLE).delete().eq("id", categoryId);
  if (error) throw error;
}

export async function listAllCategories() {
  const { data, error } = await supabase
    .from(CATEGORIES_TABLE)
    .select("id, name, slug")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

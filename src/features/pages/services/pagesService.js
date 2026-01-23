import { supabase } from "../../../lib/supabaseClient";

const PAGES_TABLE = import.meta.env.VITE_PAGES_TABLE || "pages";

export async function listPages({ page = 1, pageSize = 10, query = "" } = {}) {
  const from = Math.max(0, (page - 1) * pageSize);
  const to = from + pageSize - 1;

  let request = supabase
    .from(PAGES_TABLE)
    .select("id,title,content,last_edited_at,user_id,profiles(id,full_name,avatar_url,role)", { count: "exact" })
    .order("last_edited_at", { ascending: false })
    .range(from, to);

  if (query) {
    request = request.ilike("title", `%${query}%`);
  }

  const { data, error, count } = await request;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function getPageById(pageId) {
  const { data, error } = await supabase
    .from(PAGES_TABLE)
    .select("id,title,content,last_edited_at,user_id,profiles(id,full_name,avatar_url,role)")
    .eq("id", pageId)
    .single();
  if (error) throw error;
  return data;
}

export async function createPage(payload) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const insertPayload = {
    title: payload?.title?.trim() || "Sin título",
    content: payload?.content ?? null,
    user_id: user?.id ?? null,
  };

  const { data, error } = await supabase
    .from(PAGES_TABLE)
    .insert(insertPayload)
    .select("id,title,content,last_edited_at,user_id")
    .single();
  if (error) throw error;
  return data;
}

export async function updatePage(pageId, payload) {
  const patch = {};
  if (payload.title !== undefined) patch.title = payload.title?.trim() || "Sin título";
  if (payload.content !== undefined) patch.content = payload.content;
  patch.last_edited_at = new Date().toISOString();

  const { data, error } = await supabase
    .from(PAGES_TABLE)
    .update(patch)
    .eq("id", pageId)
    .select("id,title,content,last_edited_at,user_id")
    .single();
  if (error) throw error;
  return data;
}

export async function deletePage(pageId) {
  const { error } = await supabase.from(PAGES_TABLE).delete().eq("id", pageId);
  if (error) throw error;
}

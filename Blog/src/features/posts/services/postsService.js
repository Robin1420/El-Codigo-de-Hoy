import { supabase } from "../../../lib/supabaseClient";

// Opcional: define `VITE_POSTS_TABLE` en `.env` si tu tabla no se llama `posts` (por ejemplo `articles`).
const POSTS_TABLE = import.meta.env.VITE_POSTS_TABLE || "posts";

export async function listPosts({
  page = 1,
  pageSize = 10,
  query = "",
  status = "all",
} = {}) {
  const from = Math.max(0, (page - 1) * pageSize);
  const to = from + pageSize - 1;

  let request = supabase
    .from(POSTS_TABLE)
    .select(
      "id,title,slug,status,cover_image_url,category_id,created_at,published_at,updated_at,categories(id,name,slug)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query) {
    request = request.or(`title.ilike.%${query}%,slug.ilike.%${query}%`);
  }

  if (status !== "all") {
    request = request.eq("status", status);
  }

  const { data, error, count } = await request;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function getPostById(postId) {
  const { data, error } = await supabase
    .from(POSTS_TABLE)
    .select(
      "id,author_id,title,slug,excerpt,content,cover_image_url,category_id,status,published_at,seo_title,seo_description,canonical_url,no_index,created_at,updated_at,categories(id,name,slug)",
    )
    .eq("id", postId)
    .single();
  if (error) throw error;
  return data;
}

export async function createPost(payload) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const insertPayload = {
    ...payload,
    author_id: payload?.author_id ?? user?.id ?? null,
  };

  const { data, error } = await supabase
    .from(POSTS_TABLE)
    .insert(insertPayload)
    .select(
      "id,author_id,title,slug,excerpt,content,cover_image_url,category_id,status,published_at,seo_title,seo_description,canonical_url,no_index,created_at,updated_at",
    )
    .single();
  if (error) throw error;
  return data;
}

export async function updatePost(postId, payload) {
  const { data, error } = await supabase
    .from(POSTS_TABLE)
    .update(payload)
    .eq("id", postId)
    .select(
      "id,author_id,title,slug,excerpt,content,cover_image_url,category_id,status,published_at,seo_title,seo_description,canonical_url,no_index,created_at,updated_at",
    )
    .single();
  if (error) throw error;
  return data;
}

export async function deletePost(postId) {
  const { error } = await supabase.from(POSTS_TABLE).delete().eq("id", postId);
  if (error) throw error;
}

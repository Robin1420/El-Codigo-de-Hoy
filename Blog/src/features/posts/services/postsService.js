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
      "id,title,slug,status,cover_image_url,category_id,created_at,published_at,updated_at,categories(id,name,slug),post_tags(tag_id,tags(id,name,slug))",
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
      "id,author_id,title,slug,excerpt,content,cover_image_url,category_id,status,published_at,seo_title,seo_description,canonical_url,no_index,created_at,updated_at,categories(id,name,slug),post_tags(tag_id,tags(id,name,slug)),youtube_links(id,youtube_url,title,position)",
    )
    .eq("id", postId)
    .single();
  if (error) throw error;
  const tagIds = data?.post_tags?.map((item) => item.tag_id) ?? [];
  const youtubeLinks = data?.youtube_links ? [...data.youtube_links] : [];
  youtubeLinks.sort((a, b) => (a.position ?? 1) - (b.position ?? 1));
  const youtubeUrl = youtubeLinks[0]?.youtube_url ?? "";
  return { ...data, tag_ids: tagIds, youtube_url: youtubeUrl, youtube_links: youtubeLinks };
}

export async function syncPostTags(postId, tagIds = []) {
  await supabase.from("post_tags").delete().eq("post_id", postId);
  if (!tagIds.length) return;
  const rows = tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId }));
  const { error } = await supabase.from("post_tags").insert(rows);
  if (error) throw error;
}

export async function listPostVersions(postId) {
  const { data, error } = await supabase
    .from("post_versions")
    .select("id, editor_id, content_snapshot, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPostViewsCount(postId) {
  const { count, error } = await supabase
    .from("post_stats")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);
  if (error) throw error;
  return count ?? 0;
}

export async function listPostViews(postId, { limit = 50 } = {}) {
  const { data, error } = await supabase
    .from("post_stats")
    .select("id, post_id, user_id, ip_hash, user_agent, visited_at, profiles(id, full_name, avatar_url, role)")
    .eq("post_id", postId)
    .order("visited_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function trackPostView(postId) {
  if (!postId) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : null;
  const { error } = await supabase.from("post_stats").insert({
    post_id: postId,
    user_id: user?.id ?? null,
    user_agent: userAgent,
  });
  if (error) throw error;
}

export async function createPostVersion({ postId, editorId, snapshot }) {
  const { error } = await supabase.from("post_versions").insert({
    post_id: postId,
    editor_id: editorId,
    content_snapshot: snapshot,
  });
  if (error) throw error;
}

export async function createPost(payload) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { tag_ids: tagIds = [], youtube_url: youtubeUrl, ...postPayload } = payload || {};
  const insertPayload = {
    ...postPayload,
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
  if (tagIds.length) {
    await syncPostTags(data.id, tagIds);
  }
  if (youtubeUrl) {
    await syncPostVideo(data.id, youtubeUrl);
  }
  return getPostById(data.id);
}

export async function updatePost(postId, payload = {}) {
  const { tag_ids: tagIds, youtube_url: youtubeUrl, ...postPayload } = payload;
  const hasUpdate = Object.keys(postPayload).length > 0;
  const hasTagChange = Array.isArray(tagIds);
  const hasVideoChange = Object.prototype.hasOwnProperty.call(payload, "youtube_url");
  const shouldSnapshot = hasUpdate || hasTagChange || hasVideoChange;
  const previous = shouldSnapshot ? await getPostById(postId) : null;

  if (hasUpdate) {
    const { error } = await supabase.from(POSTS_TABLE).update(postPayload).eq("id", postId);
    if (error) throw error;
  }

  if (hasTagChange) {
    await syncPostTags(postId, tagIds);
  }

  if (hasVideoChange) {
    await syncPostVideo(postId, youtubeUrl);
  }

  if (previous) {
    const {
      post_tags,
      youtube_links,
      categories,
      tag_ids: previousTagIds,
      youtube_url: previousYoutubeUrl,
      ...rest
    } = previous;
    const snapshot = {
      ...rest,
      tag_ids: previousTagIds ?? [],
      youtube_url: previousYoutubeUrl ?? "",
    };
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await createPostVersion({ postId, editorId: user?.id ?? null, snapshot });
  }

  return getPostById(postId);
}

export async function syncPostVideo(postId, youtubeUrl) {
  await supabase.from("youtube_links").delete().eq("post_id", postId);
  const url = (youtubeUrl || "").trim();
  if (!url) return;
  const { error } = await supabase.from("youtube_links").insert({
    post_id: postId,
    youtube_url: url,
    position: 1,
  });
  if (error) throw error;
}

export async function deletePost(postId) {
  const { error } = await supabase.from(POSTS_TABLE).delete().eq("id", postId);
  if (error) throw error;
}

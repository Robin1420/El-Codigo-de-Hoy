import { supabase } from "../../../lib/supabaseClient";

const SOCIAL_TABLE = "portfolio_social_links";

export async function listSocialLinks({ page = 1, pageSize = 10, query = "" } = {}) {
  const from = Math.max(0, (page - 1) * pageSize);
  const to = from + pageSize - 1;

  let request = supabase
    .from(SOCIAL_TABLE)
    .select("id,user_id,platform_name,url,icon,position,created_at,profiles(id,full_name,avatar_url,role)", {
      count: "exact",
    })
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query) {
    request = request.or(`platform_name.ilike.%${query}%,url.ilike.%${query}%`);
  }

  const { data, error, count } = await request;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function getSocialLinkById(linkId) {
  const { data, error } = await supabase
    .from(SOCIAL_TABLE)
    .select("id,user_id,platform_name,url,icon,position,created_at")
    .eq("id", linkId)
    .single();
  if (error) throw error;
  return data;
}

export async function createSocialLink(payload) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const insertPayload = {
    user_id: user?.id ?? null,
    platform_name: payload?.platform_name?.trim() || "Sin plataforma",
    url: payload?.url?.trim() || null,
    icon: payload?.icon?.trim() || null,
    position: payload?.position ?? 1,
  };

  const { data, error } = await supabase
    .from(SOCIAL_TABLE)
    .insert(insertPayload)
    .select("id,user_id,platform_name,url,icon,position,created_at")
    .single();
  if (error) throw error;
  return data;
}

export async function updateSocialLink(linkId, payload) {
  const patch = {};
  if (payload.platform_name !== undefined) patch.platform_name = payload.platform_name?.trim() || "Sin plataforma";
  if (payload.url !== undefined) patch.url = payload.url?.trim() || null;
  if (payload.icon !== undefined) patch.icon = payload.icon?.trim() || null;
  if (payload.position !== undefined) patch.position = payload.position ?? 1;

  const { data, error } = await supabase
    .from(SOCIAL_TABLE)
    .update(patch)
    .eq("id", linkId)
    .select("id,user_id,platform_name,url,icon,position,created_at")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSocialLink(linkId) {
  const { error } = await supabase.from(SOCIAL_TABLE).delete().eq("id", linkId);
  if (error) throw error;
}

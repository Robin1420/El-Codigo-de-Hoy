import { supabase } from "../../../lib/supabaseClient";

const SKILLS_TABLE = "portfolio_skills";

export async function listSkills({ page = 1, pageSize = 10, query = "" } = {}) {
  const from = Math.max(0, (page - 1) * pageSize);
  const to = from + pageSize - 1;

  let request = supabase
    .from(SKILLS_TABLE)
    .select("id,user_id,name,category,level,created_at,profiles(id,full_name,avatar_url,role)", { count: "exact" })
    .order("level", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query) {
    request = request.or(`name.ilike.%${query}%,category.ilike.%${query}%`);
  }

  const { data, error, count } = await request;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function getSkillById(skillId) {
  const { data, error } = await supabase
    .from(SKILLS_TABLE)
    .select("id,user_id,name,category,level,created_at")
    .eq("id", skillId)
    .single();
  if (error) throw error;
  return data;
}

export async function createSkill(payload) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const insertPayload = {
    user_id: user?.id ?? null,
    name: payload?.name?.trim() || "Sin titulo",
    category: payload?.category?.trim() || null,
    level: payload?.level ?? null,
  };

  const { data, error } = await supabase
    .from(SKILLS_TABLE)
    .insert(insertPayload)
    .select("id,user_id,name,category,level,created_at")
    .single();
  if (error) throw error;
  return data;
}

export async function updateSkill(skillId, payload) {
  const patch = {};
  if (payload.name !== undefined) patch.name = payload.name?.trim() || "Sin titulo";
  if (payload.category !== undefined) patch.category = payload.category?.trim() || null;
  if (payload.level !== undefined) patch.level = payload.level ?? null;

  const { data, error } = await supabase
    .from(SKILLS_TABLE)
    .update(patch)
    .eq("id", skillId)
    .select("id,user_id,name,category,level,created_at")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSkill(skillId) {
  const { error } = await supabase.from(SKILLS_TABLE).delete().eq("id", skillId);
  if (error) throw error;
}

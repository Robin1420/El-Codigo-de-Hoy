import { supabase } from "../../../lib/supabaseClient";

const EXPERIENCE_TABLE = "portfolio_experience";

export async function listExperience({ page = 1, pageSize = 10, query = "" } = {}) {
  const from = Math.max(0, (page - 1) * pageSize);
  const to = from + pageSize - 1;

  let request = supabase
    .from(EXPERIENCE_TABLE)
    .select(
      "id,user_id,position_title,company,company_logo_url,start_date,end_date,location,current,description,created_at,profiles(id,full_name,avatar_url,role)",
      { count: "exact" },
    )
    .order("current", { ascending: false })
    .order("start_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query) {
    request = request.or(`position_title.ilike.%${query}%,company.ilike.%${query}%`);
  }

  const { data, error, count } = await request;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function getExperienceById(experienceId) {
  const { data, error } = await supabase
    .from(EXPERIENCE_TABLE)
    .select("id,user_id,position_title,company,company_logo_url,start_date,end_date,location,current,description,created_at")
    .eq("id", experienceId)
    .single();
  if (error) throw error;
  return data;
}

export async function createExperience(payload) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const insertPayload = {
    user_id: user?.id ?? null,
    position_title: payload?.position_title?.trim() || "Sin titulo",
    company: payload?.company?.trim() || "Sin empresa",
    company_logo_url: payload?.company_logo_url?.trim() || null,
    start_date: payload?.start_date || null,
    end_date: payload?.end_date || null,
    location: payload?.location?.trim() || null,
    current: Boolean(payload?.current),
    description: payload?.description ?? null,
  };

  const { data, error } = await supabase
    .from(EXPERIENCE_TABLE)
    .insert(insertPayload)
    .select(
      "id,user_id,position_title,company,company_logo_url,start_date,end_date,location,current,description,created_at",
    )
    .single();
  if (error) throw error;
  return data;
}

export async function updateExperience(experienceId, payload) {
  const patch = {};
  if (payload.position_title !== undefined) patch.position_title = payload.position_title?.trim() || "Sin titulo";
  if (payload.company !== undefined) patch.company = payload.company?.trim() || "Sin empresa";
  if (payload.company_logo_url !== undefined) patch.company_logo_url = payload.company_logo_url?.trim() || null;
  if (payload.start_date !== undefined) patch.start_date = payload.start_date || null;
  if (payload.end_date !== undefined) patch.end_date = payload.end_date || null;
  if (payload.location !== undefined) patch.location = payload.location?.trim() || null;
  if (payload.current !== undefined) patch.current = Boolean(payload.current);
  if (payload.description !== undefined) patch.description = payload.description;

  const { data, error } = await supabase
    .from(EXPERIENCE_TABLE)
    .update(patch)
    .eq("id", experienceId)
    .select(
      "id,user_id,position_title,company,company_logo_url,start_date,end_date,location,current,description,created_at",
    )
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExperience(experienceId) {
  const { error } = await supabase.from(EXPERIENCE_TABLE).delete().eq("id", experienceId);
  if (error) throw error;
}

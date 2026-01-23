import { supabase } from "../../../lib/supabaseClient";

const PROJECTS_TABLE = "portfolio_projects";

export async function listProjects({ page = 1, pageSize = 10, query = "" } = {}) {
  const from = Math.max(0, (page - 1) * pageSize);
  const to = from + pageSize - 1;

  let request = supabase
    .from(PROJECTS_TABLE)
    .select(
      "id,user_id,title,description,tech_stack,repo_url,demo_url,image_url,position,created_at,profiles(id,full_name,avatar_url,role)",
      { count: "exact" },
    )
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query) {
    request = request.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }

  const { data, error, count } = await request;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function getProjectById(projectId) {
  const { data, error } = await supabase
    .from(PROJECTS_TABLE)
    .select("id,user_id,title,description,tech_stack,repo_url,demo_url,image_url,position,created_at")
    .eq("id", projectId)
    .single();
  if (error) throw error;
  return data;
}

export async function createProject(payload) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const insertPayload = {
    user_id: user?.id ?? null,
    title: payload?.title?.trim() || "Sin t\u00edtulo",
    description: payload?.description?.trim() || null,
    tech_stack: payload?.tech_stack ?? null,
    repo_url: payload?.repo_url?.trim() || null,
    demo_url: payload?.demo_url?.trim() || null,
    image_url: payload?.image_url?.trim() || null,
    position: payload?.position ?? 1,
  };

  const { data, error } = await supabase
    .from(PROJECTS_TABLE)
    .insert(insertPayload)
    .select("id,user_id,title,description,tech_stack,repo_url,demo_url,image_url,position,created_at")
    .single();
  if (error) throw error;
  return data;
}

export async function updateProject(projectId, payload) {
  const patch = {};
  if (payload.title !== undefined) patch.title = payload.title?.trim() || "Sin t\u00edtulo";
  if (payload.description !== undefined) patch.description = payload.description?.trim() || null;
  if (payload.tech_stack !== undefined) patch.tech_stack = payload.tech_stack;
  if (payload.repo_url !== undefined) patch.repo_url = payload.repo_url?.trim() || null;
  if (payload.demo_url !== undefined) patch.demo_url = payload.demo_url?.trim() || null;
  if (payload.image_url !== undefined) patch.image_url = payload.image_url?.trim() || null;
  if (payload.position !== undefined) patch.position = payload.position;

  const { data, error } = await supabase
    .from(PROJECTS_TABLE)
    .update(patch)
    .eq("id", projectId)
    .select("id,user_id,title,description,tech_stack,repo_url,demo_url,image_url,position,created_at")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProject(projectId) {
  const { error } = await supabase.from(PROJECTS_TABLE).delete().eq("id", projectId);
  if (error) throw error;
}

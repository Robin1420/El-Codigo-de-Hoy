import { supabase } from "../lib/supabaseClient";

export const authService = {
  signInWithPassword: ({ email, password }) =>
    supabase.auth.signInWithPassword({ email, password }),
  signUpWithEmail: ({ email, password }) =>
    supabase.auth.signUp({ email, password }),
  signOut: () => supabase.auth.signOut(),
  getSession: () => supabase.auth.getSession(),
  onAuthStateChange: (callback) => supabase.auth.onAuthStateChange(callback),
};

import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ children, requiredRole = "admin" }) {
  const { user } = useAuth();
  const location = useLocation();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!active) return;
      if (error) {
        setRole(null);
      } else {
        setRole(data?.role ? data.role.trim().toLowerCase() : null);
      }
      setLoading(false);
    };
    fetchRole();
    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center bg-[var(--bg-color)] text-[var(--text-color)]">
        <p className="text-sm text-[var(--subtle-text)]">Verificando permisos...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

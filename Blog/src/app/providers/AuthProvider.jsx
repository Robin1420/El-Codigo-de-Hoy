import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { authService } from "../../services/auth";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data, error: sessionError } = await authService.getSession();
      if (!mounted) return;
      if (sessionError) {
        setError(sessionError.message);
      } else {
        setSession(data.session ?? null);
      }
      setLoading(false);
    };
    init();

    const { data: subscription } = authService.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession ?? null);
      setLoading(false);
      setError(null);
    });

    return () => {
      mounted = false;
      subscription?.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    setError(null);
    const { data, error: signInError } = await authService.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      throw signInError;
    }
    setSession(data.session ?? null);
    return data;
  }, []);

  const signUp = useCallback(async (email, password) => {
    setError(null);
    const { data, error: signUpError } = await authService.signUpWithEmail({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      throw signUpError;
    }
    setSession(data.session ?? null);
    return data;
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    const { error: signOutError } = await authService.signOut();
    if (signOutError) {
      setError(signOutError.message);
      throw signOutError;
    }
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      error,
      signIn,
      signUp,
      signOut,
    }),
    [session, loading, error, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

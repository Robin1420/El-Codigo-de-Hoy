import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Input, Link, Spacer } from "@heroui/react";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../components/ui/ToastProvider";

export default function AuthForm() {
  const { user, loading, error, signIn, signUp, signOut } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      if (mode === "login") {
        await signIn(email, password);
        setMessage("Sesión iniciada.");
        toast.success("Sesión iniciada.");
      } else {
        await signUp(email, password);
        setMessage("Registro completado. Revisa tu correo si requiere confirmación.");
        toast.success("Registro completado.");
      }
    } catch (err) {
      toast.error(err?.message || "No se pudo completar la acción.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setMessage("");
  };

  const cardClass =
    "w-full max-w-xl border border-[var(--border-color)] bg-[var(--panel-color)] shadow-lg";

  if (loading) return null;

  if (user) return null;

  return (
    <Card className={cardClass}>
      <CardHeader className="flex flex-col items-start gap-1">
        <p className="text-sm text-[var(--subtle-text)]">Autenticación Supabase</p>
        <p className="text-lg font-semibold text-[var(--text-color)]">
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </p>
      </CardHeader>
      <CardBody as="form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          isRequired
          type="email"
          label="Correo"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          isRequired
          type="password"
          label="Contraseña"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="submit"
          color="primary"
          isLoading={submitting}
          className="bg-[var(--color-500)] text-white hover:bg-[var(--color-600)]"
        >
          {mode === "login" ? "Entrar" : "Registrarme"}
        </Button>
        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Spacer y={1} />
        <Link underline="hover" className="text-sm" onPress={toggleMode}>
          {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
        </Link>
      </CardBody>
    </Card>
  );
}

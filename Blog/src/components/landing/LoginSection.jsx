import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
    uploadAvatar,
    updateProfile,
} from "../../features/profile/services/profileService";

export default function LoginSection() {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        avatarFile: null,
    });

    const steps = useMemo(
        () => [
            { key: "personal", label: "Datos personales" },
            { key: "account", label: "Correo y contraseña" },
            { key: "avatar", label: "Foto de perfil" },
        ],
        [],
    );

    const handleNext = () => {
        setError("");
        if (step === 0 && !form.fullName.trim()) {
            setError("Ingresa tu nombre completo.");
            return;
        }
        if (step === 1) {
            if (!form.email.trim()) {
                setError("Ingresa un correo válido.");
                return;
            }
            if (form.password.trim().length < 6) {
                setError("La contraseña debe tener al menos 6 caracteres.");
                return;
            }
        }
        setStep((prev) => Math.min(prev + 1, steps.length - 1));
    };

    const handleBack = () => {
        setError("");
        setStep((prev) => Math.max(prev - 1, 0));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const { data, error: signError } = await supabase.auth.signUp({
                email: form.email.trim(),
                password: form.password,
                options: {
                    data: { full_name: form.fullName.trim() },
                },
            });

            if (signError) throw signError;

            const userId = data?.user?.id;
            if (userId) {
                let avatarUrl = null;
                if (form.avatarFile) {
                    avatarUrl = await uploadAvatar(userId, form.avatarFile);
                }
                await updateProfile(userId, {
                    full_name: form.fullName.trim(),
                    avatar_url: avatarUrl,
                });
            }

            setSuccess("Registro completo. Revisa tu correo para confirmar el acceso.");
            setForm({ fullName: "", email: "", password: "", avatarFile: null });
            setStep(0);
        } catch (err) {
            setError(err?.message || "No se pudo completar el registro.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => setSuccess(""), 6000);
        return () => clearTimeout(timer);
    }, [success]);

    return (
        <div className="rounded-2xl bg-[var(--color-500)] text-white p-6 sm:p-8 shadow-sm">
            <div className="  rounded-xl px-4 py-6 backdrop-blur-md">
                <div className="flex flex-col gap-3 text-center">
                    <span className="text-xs uppercase tracking-[0.3em] opacity-80">
                        El Código de Hoy
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold">
                        Descubre lo último antes que nadie
                    </h3>
                    <p className="text-sm sm:text-base text-white/90">
                        Únete hoy y recibe información exclusiva, lanzamientos especiales y
                        contenido pensado para ti, siempre al día de forma clara y sencilla.
                    </p>
                </div>

                <form
                    className="mt-6 w-full max-w-2xl mx-auto flex flex-col gap-4"
                    onSubmit={handleSubmit}
                >
                    <ol className="w-full space-y-4 sm:flex sm:space-x-8 sm:space-y-0">
                        {steps.map((s, idx) => {
                            const isActive = idx === step;
                            const isDone = idx < step;
                            return (
                                <li
                                    key={s.key}
                                    className={[
                                        "flex items-center space-x-3",
                                        isActive || isDone ? "text-white" : "text-white/70",
                                    ].join(" ")}
                                >
                                    <span
                                        className={[
                                            "flex items-center justify-center w-10 h-10 rounded-full shrink-0",
                                            isActive || isDone
                                                ? "bg-white/20"
                                                : "bg-white/10",
                                        ].join(" ")}
                                    >
                                        {isDone ? (
                                            <svg
                                                className="w-5 h-5 text-white"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                            >
                                                <path
                                                    d="M5 11.917 9.724 16.5 19 7.5"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                />
                                            </svg>
                                        ) : idx === 0 ? (
                                            <svg
                                                className="w-5 h-5 text-white"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                            >
                                                <path
                                                    d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm-8 8a8 8 0 0 1 16 0"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                />
                                            </svg>
                                        ) : idx === 1 ? (
                                            <svg
                                                className="w-5 h-5 text-white"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                            >
                                                <path
                                                    d="M7 8h10M7 12h6m-8 7h14a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="w-5 h-5 text-white"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                            >
                                                <path
                                                    d="M12 7.5a4.5 4.5 0 1 0 4.5 4.5M16.5 4.5h3v3M13.5 13.5l6-6"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                />
                                            </svg>
                                        )}
                                    </span>
                                    <span>
                                        <h3 className="font-medium leading-tight">{s.label}</h3>
                                        <p className="text-xs text-white/70">
                                            {idx === 0 && "Nombre y datos básicos"}
                                            {idx === 1 && "Correo y contraseña"}
                                            {idx === 2 && "Foto de perfil"}
                                        </p>
                                    </span>
                                </li>
                            );
                        })}
                    </ol>

                    {step === 0 && (
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">Nombre completo</label>
                            <input
                                type="text"
                                value={form.fullName}
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, fullName: event.target.value }))
                                }
                                placeholder="Robinzon Sanchez Gonzales"
                                className="w-full rounded-xl border border-white bg-white px-3 py-2 text-black placeholder-neutral-500 outline-none focus:border-white"
                            />
                        </div>
                    )}

                    {step === 1 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold">Correo</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, email: event.target.value }))
                                    }
                                    placeholder="tu@email.com"
                                    className="w-full rounded-xl border border-white bg-white px-3 py-2 text-black placeholder-neutral-500 outline-none focus:border-white"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold">Contraseña</label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(event) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            password: event.target.value,
                                        }))
                                    }
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full rounded-xl border border-white bg-white px-3 py-2 text-black placeholder-neutral-500 outline-none focus:border-white"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">Sube tu foto</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        avatarFile: event.target.files?.[0] ?? null,
                                    }))
                                }
                                className="w-full rounded-xl border border-white bg-white px-3 py-2 text-black file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-200 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-black"
                            />
                            <p className="text-xs text-white/70">
                                Opcional. Puedes cambiarla más tarde.
                            </p>
                        </div>
                    )}

                    {error && <p className="text-sm text-white/80">{error}</p>}
                    {success && <p className="text-sm text-white/80">{success}</p>}

                    <div className="flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={handleBack}
                            disabled={step === 0}
            className="rounded-xl border border-white px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ borderColor: "#ffffff" }}
                        >
                            Atrás
                        </button>
                        {step < steps.length - 1 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="rounded-xl bg-white text-[var(--color-500)] px-4 py-2 text-sm font-semibold"
                            >
                                Siguiente
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-xl bg-white text-[var(--color-500)] px-4 py-2 text-sm font-semibold disabled:opacity-60"
                            >
                                {loading ? "Registrando..." : "Crear cuenta"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "../../../../components/ui/Modal";
import { ExperienceForm } from "../../../../features/portfolio/components/ExperienceForm";
import { getExperienceById, updateExperience } from "../../../../features/portfolio/services/experienceService";
import { useToast } from "../../../../components/ui/ToastProvider";
import { getChangedFields } from "../../../../lib/patch";

export default function ExperienceEditPage() {
  const { experienceId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!experienceId) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    getExperienceById(experienceId)
      .then((data) => {
        if (cancelled) return;
        setInitialValues(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "No se pudo cargar la experiencia.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [experienceId]);

  return (
    <Modal
      open
      title={loading ? "Cargando..." : initialValues?.position_title ? `Editar: ${initialValues.position_title}` : "Editar experiencia"}
      onClose={() => navigate("/dashboard/portfolio/experience")}
    >
      {error && !initialValues ? (
        <div className="rounded-xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] px-4 py-3">
          <p className="text-sm font-semibold text-[rgba(248,113,113,0.95)]">{error}</p>
        </div>
      ) : (
        <ExperienceForm
          mode="edit"
          variant="modal"
          initialValues={initialValues}
          submitLabel="Guardar"
          submitting={submitting || loading}
          error={error}
          onCancel={() => navigate("/dashboard/portfolio/experience")}
          onSubmit={async (values) => {
            try {
              const patch = getChangedFields(values, initialValues);
              if (Object.keys(patch).length === 0) {
                toast.info("No hay cambios para guardar.");
                return;
              }
              setSubmitting(true);
              setError("");
              const updated = await updateExperience(experienceId, patch);
              setInitialValues(updated);
              toast.success("Experiencia actualizada.");
            } catch (err) {
              setError(err?.message || "No se pudo actualizar la experiencia.");
              toast.error(err?.message || "No se pudo actualizar la experiencia.");
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}
    </Modal>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "../../../../components/ui/Modal";
import { SkillsForm } from "../../../../features/portfolio/components/SkillsForm";
import { getSkillById, updateSkill } from "../../../../features/portfolio/services/skillsService";
import { useToast } from "../../../../components/ui/ToastProvider";
import { getChangedFields } from "../../../../lib/patch";

export default function SkillEditPage() {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!skillId) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    getSkillById(skillId)
      .then((data) => {
        if (cancelled) return;
        setInitialValues(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "No se pudo cargar la habilidad.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [skillId]);

  return (
    <Modal
      open
      title={loading ? "Cargando..." : initialValues?.name ? `Editar: ${initialValues.name}` : "Editar habilidad"}
      onClose={() => navigate("/dashboard/portfolio/skills")}
    >
      {error && !initialValues ? (
        <div className="rounded-xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] px-4 py-3">
          <p className="text-sm font-semibold text-[rgba(248,113,113,0.95)]">{error}</p>
        </div>
      ) : (
        <SkillsForm
          mode="edit"
          variant="modal"
          initialValues={initialValues}
          submitLabel="Guardar"
          submitting={submitting || loading}
          error={error}
          onCancel={() => navigate("/dashboard/portfolio/skills")}
          onSubmit={async (values) => {
            try {
              const patch = getChangedFields(values, initialValues);
              if (Object.keys(patch).length === 0) {
                toast.info("No hay cambios para guardar.");
                return;
              }
              setSubmitting(true);
              setError("");
              const updated = await updateSkill(skillId, patch);
              setInitialValues(updated);
              toast.success("Habilidad actualizada.");
            } catch (err) {
              setError(err?.message || "No se pudo actualizar la habilidad.");
              toast.error(err?.message || "No se pudo actualizar la habilidad.");
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}
    </Modal>
  );
}

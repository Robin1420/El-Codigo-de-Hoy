import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../../../components/ui/Modal";
import { SkillsForm } from "../../../../features/portfolio/components/SkillsForm";
import { createSkill } from "../../../../features/portfolio/services/skillsService";
import { useToast } from "../../../../components/ui/ToastProvider";

export default function SkillNewPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <Modal open title="Nueva habilidad" onClose={() => navigate("/dashboard/portfolio/skills")}>
      <SkillsForm
        mode="create"
        variant="modal"
        submitLabel="Crear"
        submitting={submitting}
        error={error}
        onCancel={() => navigate("/dashboard/portfolio/skills")}
        onSubmit={async (values) => {
          setSubmitting(true);
          setError("");
          try {
            await createSkill(values);
            toast.success("Habilidad creada.");
            navigate("/dashboard/portfolio/skills", { replace: true });
          } catch (err) {
            setError(err?.message || "No se pudo crear la habilidad.");
            toast.error(err?.message || "No se pudo crear la habilidad.");
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </Modal>
  );
}

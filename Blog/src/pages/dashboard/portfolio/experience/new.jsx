import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../../../components/ui/Modal";
import { ExperienceForm } from "../../../../features/portfolio/components/ExperienceForm";
import { createExperience } from "../../../../features/portfolio/services/experienceService";
import { useToast } from "../../../../components/ui/ToastProvider";

export default function ExperienceNewPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <Modal open title="Nueva experiencia" onClose={() => navigate("/dashboard/portfolio/experience")}>
      <ExperienceForm
        mode="create"
        variant="modal"
        submitLabel="Crear"
        submitting={submitting}
        error={error}
        onCancel={() => navigate("/dashboard/portfolio/experience")}
        onSubmit={async (values) => {
          setSubmitting(true);
          setError("");
          try {
            await createExperience(values);
            toast.success("Experiencia creada.");
            navigate("/dashboard/portfolio/experience", { replace: true });
          } catch (err) {
            setError(err?.message || "No se pudo crear la experiencia.");
            toast.error(err?.message || "No se pudo crear la experiencia.");
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </Modal>
  );
}

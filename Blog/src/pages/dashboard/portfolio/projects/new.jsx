import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../../../components/ui/Modal";
import { ProjectForm } from "../../../../features/portfolio/components/ProjectForm";
import { createProject } from "../../../../features/portfolio/services/projectsService";
import { useToast } from "../../../../components/ui/ToastProvider";

export default function ProjectNewPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <Modal open title="Nuevo proyecto" onClose={() => navigate("/dashboard/portfolio/projects")}>
      <ProjectForm
        mode="create"
        variant="modal"
        submitLabel="Crear"
        submitting={submitting}
        error={error}
        onCancel={() => navigate("/dashboard/portfolio/projects")}
        onSubmit={async (values) => {
          setSubmitting(true);
          setError("");
          try {
            await createProject(values);
            toast.success("Proyecto creado.");
            navigate("/dashboard/portfolio/projects", { replace: true });
          } catch (err) {
            setError(err?.message || "No se pudo crear el proyecto.");
            toast.error(err?.message || "No se pudo crear el proyecto.");
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </Modal>
  );
}

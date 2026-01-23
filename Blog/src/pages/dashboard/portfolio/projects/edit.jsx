import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "../../../../components/ui/Modal";
import { ProjectForm } from "../../../../features/portfolio/components/ProjectForm";
import { getProjectById, updateProject } from "../../../../features/portfolio/services/projectsService";
import { useToast } from "../../../../components/ui/ToastProvider";
import { getChangedFields } from "../../../../lib/patch";

export default function ProjectEditPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    getProjectById(projectId)
      .then((data) => {
        if (cancelled) return;
        setInitialValues(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "No se pudo cargar el proyecto.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <Modal
      open
      title={loading ? "Cargando..." : initialValues?.title ? `Editar: ${initialValues.title}` : "Editar proyecto"}
      onClose={() => navigate("/dashboard/portfolio/projects")}
    >
      {error && !initialValues ? (
        <div className="rounded-xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] px-4 py-3">
          <p className="text-sm font-semibold text-[rgba(248,113,113,0.95)]">{error}</p>
        </div>
      ) : (
        <ProjectForm
          mode="edit"
          variant="modal"
          initialValues={initialValues}
          submitLabel="Guardar"
          submitting={submitting || loading}
          error={error}
          onCancel={() => navigate("/dashboard/portfolio/projects")}
          onSubmit={async (values) => {
            try {
              const patch = getChangedFields(values, initialValues);
              if (Object.keys(patch).length === 0) {
                toast.info("No hay cambios para guardar.");
                return;
              }
              setSubmitting(true);
              setError("");
              const updated = await updateProject(projectId, patch);
              setInitialValues(updated);
              toast.success("Proyecto actualizado.");
            } catch (err) {
              setError(err?.message || "No se pudo actualizar el proyecto.");
              toast.error(err?.message || "No se pudo actualizar el proyecto.");
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}
    </Modal>
  );
}

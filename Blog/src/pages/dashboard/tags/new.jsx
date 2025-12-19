import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../../components/ui/Modal";
import { createTag } from "../../../features/tags/services/tagsService";
import { TagForm } from "../../../features/tags/components/TagForm";
import { useToast } from "../../../components/ui/ToastProvider";

export default function TagNewPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <Modal open title="Nuevo tag" onClose={() => navigate("/dashboard/tags")}>
      <TagForm
        mode="create"
        variant="modal"
        submitLabel="Crear"
        submitting={submitting}
        error={error}
        onCancel={() => navigate("/dashboard/tags")}
        onSubmit={async (values) => {
          setSubmitting(true);
          setError("");
          try {
            await createTag(values);
            toast.success("Tag creado.");
            navigate("/dashboard/tags", { replace: true });
          } catch (err) {
            setError(err?.message || "No se pudo crear el tag.");
            toast.error(err?.message || "No se pudo crear el tag.");
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </Modal>
  );
}


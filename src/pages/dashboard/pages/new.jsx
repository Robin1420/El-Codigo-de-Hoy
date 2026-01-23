import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../../components/ui/Modal";
import { PageForm } from "../../../features/pages/components/PageForm";
import { createPage } from "../../../features/pages/services/pagesService";
import { useToast } from "../../../components/ui/ToastProvider";

export default function PageNewPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <Modal open title="Nueva página" onClose={() => navigate("/dashboard/pages")}>
      <PageForm
        mode="create"
        variant="modal"
        submitLabel="Crear"
        submitting={submitting}
        error={error}
        onSubmit={async (values) => {
          try {
            setSubmitting(true);
            setError("");
            await createPage(values);
            toast.success("Página creada.");
            navigate("/dashboard/pages", { replace: true });
          } catch (err) {
            setError(err?.message || "No se pudo crear la página.");
            toast.error(err?.message || "No se pudo crear la página.");
          } finally {
            setSubmitting(false);
          }
        }}
        onCancel={() => navigate("/dashboard/pages")}
      />
    </Modal>
  );
}
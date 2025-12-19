import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../../components/ui/Modal";
import { createCategory } from "../../../features/categories/services/categoriesService";
import { CategoryForm } from "../../../features/categories/components/CategoryForm";

export default function CategoryNewPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <Modal open title="Nueva categoría" onClose={() => navigate("/dashboard/categories")}>
      <CategoryForm
        mode="create"
        variant="modal"
        submitLabel="Crear"
        submitting={submitting}
        error={error}
        onCancel={() => navigate("/dashboard/categories")}
        onSubmit={async (values) => {
          setSubmitting(true);
          setError("");
          try {
            await createCategory(values);
            navigate("/dashboard/categories", { replace: true });
          } catch (err) {
            setError(err?.message || "No se pudo crear la categoría.");
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </Modal>
  );
}


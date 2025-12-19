import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "../../../components/ui/Modal";
import { getCategoryById, updateCategory } from "../../../features/categories/services/categoriesService";
import { CategoryForm } from "../../../features/categories/components/CategoryForm";

export default function CategoryEditPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getCategoryById(categoryId)
      .then((category) => {
        if (cancelled) return;
        setInitialValues(category);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "No se pudo cargar la categoría.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  return (
    <Modal
      open
      title={loading ? "Cargando…" : initialValues?.name ? `Editar: ${initialValues.name}` : "Editar categoría"}
      onClose={() => navigate("/dashboard/categories")}
    >
      {error && !initialValues ? (
        <div className="rounded-xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] px-4 py-3">
          <p className="text-sm font-semibold text-[rgba(248,113,113,0.95)]">{error}</p>
        </div>
      ) : (
        <CategoryForm
          mode="edit"
          variant="modal"
          initialValues={initialValues}
          submitLabel="Guardar"
          submitting={submitting || loading}
          error={error}
          onCancel={() => navigate("/dashboard/categories")}
          onSubmit={async (values) => {
            setSubmitting(true);
            setError("");
            try {
              const updated = await updateCategory(categoryId, values);
              setInitialValues(updated);
            } catch (err) {
              setError(err?.message || "No se pudo guardar la categoría.");
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}
    </Modal>
  );
}


import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "../../../components/ui/Modal";
import { getTagById, updateTag } from "../../../features/tags/services/tagsService";
import { TagForm } from "../../../features/tags/components/TagForm";
import { useToast } from "../../../components/ui/ToastProvider";
import { getChangedFields } from "../../../lib/patch";

export default function TagEditPage() {
  const { tagId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getTagById(tagId)
      .then((tag) => {
        if (cancelled) return;
        setInitialValues(tag);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "No se pudo cargar el tag.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tagId]);

  return (
    <Modal
      open
      title={loading ? "Cargando…" : initialValues?.name ? `Editar: ${initialValues.name}` : "Editar tag"}
      onClose={() => navigate("/dashboard/tags")}
    >
      {error && !initialValues ? (
        <div className="rounded-xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] px-4 py-3">
          <p className="text-sm font-semibold text-[rgba(248,113,113,0.95)]">{error}</p>
        </div>
      ) : (
        <TagForm
          mode="edit"
          variant="modal"
          initialValues={initialValues}
          submitLabel="Guardar"
          submitting={submitting || loading}
          error={error}
          onCancel={() => navigate("/dashboard/tags")}
          onSubmit={async (values) => {
            try {
              const patch = getChangedFields(values, initialValues);
              if (Object.keys(patch).length === 0) {
                toast.info("No hay cambios para guardar.");
                return;
              }
              setSubmitting(true);
              setError("");
              const updated = await updateTag(tagId, patch);
              setInitialValues(updated);
              toast.success("Tag actualizado.");
            } catch (err) {
              setError(err?.message || "No se pudo guardar el tag.");
              toast.error(err?.message || "No se pudo guardar el tag.");
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}
    </Modal>
  );
}


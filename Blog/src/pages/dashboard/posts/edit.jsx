import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "../../../components/ui/Modal";
import { getPostById, updatePost } from "../../../features/posts/services/postsService";
import { PostForm } from "../../../features/posts/components/PostForm";

export default function PostEditPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getPostById(postId)
      .then((post) => {
        if (cancelled) return;
        setInitialValues(post);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "No se pudo cargar el artículo.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  return (
    <Modal
      open
      title={loading ? "Cargando…" : initialValues?.title ? `Editar: ${initialValues.title}` : "Editar artículo"}
      onClose={() => navigate("/dashboard/posts")}
      maxWidthClassName="max-w-2xl"
    >
      {error && !initialValues ? (
        <div className="rounded-xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] px-4 py-3">
          <p className="text-sm font-semibold text-[rgba(248,113,113,0.95)]">{error}</p>
        </div>
      ) : (
        <PostForm
          mode="edit"
          variant="modal"
          initialValues={initialValues}
          submitLabel="Guardar"
          submitting={submitting || loading}
          error={error}
          onCancel={() => navigate("/dashboard/posts")}
          onSubmit={async (values) => {
            setSubmitting(true);
            setError("");
            try {
              const updated = await updatePost(postId, values);
              setInitialValues(updated);
            } catch (err) {
              setError(err?.message || "No se pudo guardar el artículo.");
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}
    </Modal>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../../components/ui/Modal";
import { createPost } from "../../../features/posts/services/postsService";
import { PostForm } from "../../../features/posts/components/PostForm";

export default function PostNewPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <Modal open title="Nuevo artículo" onClose={() => navigate("/dashboard/posts")}>
      <PostForm
        mode="create"
        variant="modal"
        submitLabel="Crear"
        submitting={submitting}
        error={error}
        onCancel={() => navigate("/dashboard/posts")}
        onSubmit={async (values) => {
          setSubmitting(true);
          setError("");
          try {
            const created = await createPost(values);
            navigate(`/dashboard/posts/${created.id}/edit`, { replace: true });
          } catch (err) {
            setError(err?.message || "No se pudo crear el artículo.");
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </Modal>
  );
}

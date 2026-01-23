import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../../../components/ui/Modal";
import { SocialLinksForm } from "../../../../features/portfolio/components/SocialLinksForm";
import { createSocialLink } from "../../../../features/portfolio/services/socialLinksService";
import { useToast } from "../../../../components/ui/ToastProvider";

export default function SocialNewPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <Modal open title="Nuevo enlace" onClose={() => navigate("/dashboard/portfolio/social")}>
      <SocialLinksForm
        mode="create"
        variant="modal"
        submitLabel="Crear"
        submitting={submitting}
        error={error}
        onCancel={() => navigate("/dashboard/portfolio/social")}
        onSubmit={async (values) => {
          setSubmitting(true);
          setError("");
          try {
            await createSocialLink(values);
            toast.success("Enlace creado.");
            navigate("/dashboard/portfolio/social", { replace: true });
          } catch (err) {
            setError(err?.message || "No se pudo crear el enlace.");
            toast.error(err?.message || "No se pudo crear el enlace.");
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </Modal>
  );
}

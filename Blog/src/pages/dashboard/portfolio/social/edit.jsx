import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "../../../../components/ui/Modal";
import { SocialLinksForm } from "../../../../features/portfolio/components/SocialLinksForm";
import { getSocialLinkById, updateSocialLink } from "../../../../features/portfolio/services/socialLinksService";
import { useToast } from "../../../../components/ui/ToastProvider";
import { getChangedFields } from "../../../../lib/patch";

export default function SocialEditPage() {
  const { socialId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!socialId) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    getSocialLinkById(socialId)
      .then((data) => {
        if (cancelled) return;
        setInitialValues(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "No se pudo cargar el enlace.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [socialId]);

  return (
    <Modal
      open
      title={loading ? "Cargando..." : initialValues?.platform_name ? `Editar: ${initialValues.platform_name}` : "Editar enlace"}
      onClose={() => navigate("/dashboard/portfolio/social")}
    >
      {error && !initialValues ? (
        <div className="rounded-xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] px-4 py-3">
          <p className="text-sm font-semibold text-[rgba(248,113,113,0.95)]">{error}</p>
        </div>
      ) : (
        <SocialLinksForm
          mode="edit"
          variant="modal"
          initialValues={initialValues}
          submitLabel="Guardar"
          submitting={submitting || loading}
          error={error}
          onCancel={() => navigate("/dashboard/portfolio/social")}
          onSubmit={async (values) => {
            try {
              const patch = getChangedFields(values, initialValues);
              if (Object.keys(patch).length === 0) {
                toast.info("No hay cambios para guardar.");
                return;
              }
              setSubmitting(true);
              setError("");
              const updated = await updateSocialLink(socialId, patch);
              setInitialValues(updated);
              toast.success("Enlace actualizado.");
            } catch (err) {
              setError(err?.message || "No se pudo actualizar el enlace.");
              toast.error(err?.message || "No se pudo actualizar el enlace.");
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}
    </Modal>
  );
}

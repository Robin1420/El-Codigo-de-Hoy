import { useEffect, useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

function getContentText(content) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (typeof content === "object") return content.body || content.text || content.markdown || "";
  return "";
}

function getContentType(content, fallback) {
  if (content && typeof content === "object" && content.type) return content.type;
  return fallback;
}

export function PageForm({ mode, initialValues, onSubmit, submitting, error, onCancel }) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [contentText, setContentText] = useState(getContentText(initialValues?.content));
  const [contentFormat, setContentFormat] = useState(
    getContentType(initialValues?.content, mode === "create" ? "html" : "markdown"),
  );
  const isHtmlContent = contentFormat === "html";

  useEffect(() => {
    setTitle(initialValues?.title ?? "");
    setContentText(getContentText(initialValues?.content));
    setContentFormat(getContentType(initialValues?.content, mode === "create" ? "html" : "markdown"));
  }, [initialValues, mode]);

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  return (
    <form
      className="theme-surface bg-[var(--panel-color)] rounded-2xl p-4 shadow-sm flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit || submitting) return;
        onSubmit({
          title: title.trim(),
          content: contentText.trim() ? { type: contentFormat, body: contentText.trim() } : null,
        });
      }}
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-[var(--subtle-text)]">Título</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la página…"
          className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-[var(--subtle-text)]">Formato de contenido</label>
        <select
          value={contentFormat}
          onChange={(e) => setContentFormat(e.target.value)}
          className="h-11 rounded-xl border border-[var(--border-color)] bg-transparent px-3 outline-none focus:border-[var(--color-500)] transition-colors"
        >
          <option value="html">HTML/CSS</option>
          <option value="markdown">Markdown</option>
        </select>
        <p className="text-xs text-[var(--subtle-text)]">
          Puedes usar HTML y CSS (por ejemplo, incluir un <code>&lt;style&gt;</code>).
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-[var(--subtle-text)]">Contenido</label>
        {isHtmlContent ? (
          <div className="rounded-xl border border-[#30363d] bg-[#0d1117] shadow-inner overflow-hidden">
            <CodeMirror
              value={contentText}
              height="320px"
              theme={vscodeDark}
              extensions={[html()]}
              onChange={(value) => setContentText(value)}
              basicSetup={{ lineNumbers: true, foldGutter: true }}
            />
          </div>
        ) : (
          <textarea
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            rows={12}
            placeholder="Contenido de la página (Markdown)…"
            className="rounded-xl border border-[var(--border-color)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-500)] transition-colors resize-y"
          />
        )}
      </div>

      {error ? (
        <div className="rounded-xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)] px-4 py-3">
          <p className="text-sm font-semibold text-[rgba(248,113,113,0.95)]">{error}</p>
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <button
            type="button"
            className="h-11 px-4 rounded-xl border border-[var(--border-color)] font-semibold hover:border-[var(--color-500)] transition-colors"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancelar
          </button>
        ) : null}
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className={[
            "h-11 px-4 rounded-xl font-semibold transition-colors shadow-sm",
            "border border-[var(--color-500)]",
            !canSubmit || submitting
              ? "opacity-60 cursor-not-allowed bg-[var(--color-500)] text-white"
              : "bg-[var(--color-500)] text-white hover:bg-[var(--color-600)]",
          ].join(" ")}
        >
          {submitting ? "Guardando…" : mode === "edit" ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
}

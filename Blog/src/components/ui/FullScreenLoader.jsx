import "./FullScreenLoader.css";

export function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)]">
      <div className="loader-stack" aria-label="Cargando" role="status">
        <div className="spinner">
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
        </div>
        <p className="loader-text">
          Cargando
          <span className="loader-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      </div>
    </div>
  );
}

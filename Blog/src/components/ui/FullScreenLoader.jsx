import "./FullScreenLoader.css";

export function FullScreenLoader({
  fullScreen = true,
  label = "Cargando",
  minHeightClassName,
}) {
  const containerClassName = fullScreen
    ? "min-h-screen flex items-center justify-center bg-[var(--bg-color)]"
    : `w-full flex items-center justify-center ${minHeightClassName ?? "min-h-[50vh]"} mt-6`;

  return (
    <div className={containerClassName}>
      <div className="loader-stack" aria-label={label} role="status">
        <div className="spinner">
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
        </div>
        <p className="loader-text">
          {label}
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

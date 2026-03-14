import { useEffect } from "react";

interface CelebrationOverlayProps {
  winners: ReadonlySet<number>;
  maxWinners: number;
  onClose: () => void;
  isDark: boolean;
}

function getGridCols(k: number): string {
  if (k <= 3) return "grid-cols-3";
  if (k <= 4) return "grid-cols-4";
  if (k <= 5) return "grid-cols-5";
  if (k <= 8) return "grid-cols-4 sm:grid-cols-8";
  return "grid-cols-5 sm:grid-cols-10";
}

export default function CelebrationOverlay({
  winners,
  maxWinners,
  onClose,
  isDark,
}: CelebrationOverlayProps) {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `@keyframes celebrationIn { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }`;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${isDark ? "glass-dark" : "glass-light"} border-glow rounded-2xl p-8 max-w-lg w-full shadow-2xl`}
        style={{
          animation: "celebrationIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <p
            className="font-mono text-xs tracking-widest mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            SORTEO COMPLETADO
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient-evalia animate-pulse-glow mb-3">
            ¡FELICIDADES!
          </h2>
          <p className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
            A LOS GANADORES DEL SORTEO
          </p>
        </div>

        {/* Decorative separator */}
        <div
          className="border-t my-4"
          style={{ borderColor: "var(--border-default)" }}
        />

        {/* Winners grid */}
        <div className={`grid ${getGridCols(maxWinners)} gap-3 mb-6`}>
          {Array.from(winners)
            .sort((a, b) => a - b)
            .map((n) => (
              <div
                key={n}
                className="flex items-center justify-center h-12 w-full rounded-xl font-mono font-bold text-lg border glow-evalia-strong animate-pulse-glow"
                style={{
                  background: "color-mix(in srgb, var(--accent) 25%, transparent)",
                  borderColor: "var(--border-glow)",
                  color: "var(--accent)",
                }}
              >
                {n}
              </div>
            ))}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full h-12 rounded-xl font-bold font-mono tracking-widest text-white transition-all duration-200 bg-gradient-to-r from-evalia-700 to-evalia-500 hover:from-evalia-600 hover:to-evalia-400 hover:glow-evalia focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer"
        >
          [ CERRAR ]
        </button>
      </div>
    </div>
  );
}

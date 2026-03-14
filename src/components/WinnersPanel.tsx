interface WinnersPanelProps {
  selected: ReadonlySet<number>;
  maxWinners: number;
  onClear: () => void;
  isDark: boolean;
}

export default function WinnersPanel({ selected, maxWinners, onClear, isDark }: WinnersPanelProps) {
  const sortedNumbers = Array.from(selected).sort((a, b) => a - b);

  return (
    <div
      className={`${isDark ? "glass-dark" : "glass-light"} border-glow rounded-2xl p-4 min-h-[120px]`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="font-mono font-bold text-xs tracking-widest uppercase text-gradient-evalia">
          ¡GANADORES!
        </p>
        <span
          className="font-mono text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          ({selected.size}/{maxWinners})
        </span>
      </div>

      {/* Decorative separator */}
      <div
        className="border-t mb-3"
        style={{ borderColor: "var(--border-default)" }}
      />

      {/* Number list */}
      {sortedNumbers.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {sortedNumbers.map((n) => (
            <div
              key={n}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg font-mono font-bold text-sm border transition-all duration-200"
              style={{
                background: "color-mix(in srgb, var(--accent) 20%, transparent)",
                borderColor: "var(--border-glow)",
                color: "var(--accent)",
                boxShadow: "0 0 8px color-mix(in srgb, var(--accent) 25%, transparent)",
              }}
            >
              {n}
            </div>
          ))}
        </div>
      ) : (
        <p
          className="font-mono text-xs mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          // Sin ganadores seleccionados
        </p>
      )}

      {/* Clear button — only when there are selections */}
      {selected.size > 0 && (
        <>
          <div
            className="border-t mb-3"
            style={{ borderColor: "var(--border-default)" }}
          />
          <button
            type="button"
            onClick={onClear}
            className="w-full rounded-lg border px-3 py-1.5 font-mono text-xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer"
            style={{
              borderColor: "var(--border-default)",
              background: "transparent",
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "var(--border-glow)";
              el.style.color = "var(--accent)";
              el.style.boxShadow = "0 0 10px color-mix(in srgb, var(--accent) 30%, transparent)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "var(--border-default)";
              el.style.color = "var(--text-secondary)";
              el.style.boxShadow = "none";
            }}
          >
            [ LIMPIAR ]
          </button>
        </>
      )}
    </div>
  );
}

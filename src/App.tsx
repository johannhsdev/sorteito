import { useId, useMemo, useState } from "react";
import Logo from "./components/Logo";
import NumberBadge from "./components/NumberBadge";
import NeuralBackground from "./components/NeuralBackground";
import ThemeToggle from "./components/ThemeToggle";
import WinnersPanel from "./components/WinnersPanel";
import CelebrationCanvas from "./components/CelebrationCanvas";
import CelebrationOverlay from "./components/CelebrationOverlay";
import LogoEvalIA from "./assets/evalia.png";
import { useRandomDraw } from "./hooks/useRandomDraw";
import { useTheme } from "./hooks/useTheme";
import { useWinnersCelebration } from "./hooks/useWinnersCelebration";

interface FormState {
  max: string;   // N — número máximo del rango
  count: string; // K — cantidad de ganadores
}

export default function App() {
  const inputId = useId();
  const countInputId = useId();
  const { loading, error, last, draw } = useRandomDraw();
  const { toggleTheme, isDark } = useTheme();
  const [form, setForm] = useState<FormState>({ max: "", count: "" });
  const [touched, setTouched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const maxAsInt = useMemo(() => {
    const n = parseInt(form.max, 10);
    return Number.isFinite(n) ? n : NaN;
  }, [form.max]);

  const countAsInt = useMemo(() => {
    const n = parseInt(form.count, 10);
    return Number.isFinite(n) ? n : NaN;
  }, [form.count]);

  const formError = useMemo(() => {
    if (!touched) return null;
    if (form.max.trim() === "") return "Requerido.";
    if (!Number.isInteger(maxAsInt)) return "Debe ser un número entero.";
    if (maxAsInt < 1) return "Debe ser ≥ 1.";
    return null;
  }, [touched, form.max, maxAsInt]);

  const countError = useMemo(() => {
    if (!touched) return null;
    if (form.count.trim() === "") return "Requerido.";
    if (!Number.isInteger(countAsInt)) return "Debe ser un número entero.";
    if (countAsInt < 1) return "Debe ser ≥ 1.";
    if (Number.isFinite(maxAsInt) && countAsInt > maxAsInt) return `Debe ser ≤ N (${maxAsInt}).`;
    return null;
  }, [touched, form.count, countAsInt, maxAsInt]);

  function clearSelected() {
    setSelected(new Set());
  }

  function onChangeMax(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((s) => ({ ...s, max: e.target.value.replace(/\D/g, "").slice(0, 9) }));
    clearSelected();
  }

  function onChangeCount(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((s) => ({ ...s, count: e.target.value.replace(/\D/g, "").slice(0, 4) }));
    clearSelected();
  }

  function toggleSelect(value: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (formError || countError) return;
    try {
      const result = await draw(maxAsInt, countAsInt, selected);
      setSelected((prev) => {
        const resultSet = new Set(result.numbers);
        const next = new Set<number>();
        for (const n of prev) {
          if (resultSet.has(n)) next.add(n);
        }
        return next;
      });
    } catch {
      // error ya lo maneja el hook
    }
  }

  const { celebrating, stopCelebration } = useWinnersCelebration(selected.size, countAsInt || 0);

  const canSubmit = !loading && !formError && !countError && form.max.trim() !== "" && form.count.trim() !== "";

  async function copyToClipboard() {
    if (!last) return;
    try {
      await navigator.clipboard.writeText(last.numbers.join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail
    }
  }

  return (
    <div className="relative min-h-dvh">
      {/* Animated neural network canvas — fixed, full screen, behind everything */}
      <NeuralBackground isDark={isDark} />

      {/* All content sits above the canvas */}
      <div className="relative z-10 min-h-dvh flex flex-col">
        {/* Header — theme toggle pinned top-right */}
        <header className="fixed top-0 right-0 p-4 z-20">
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-start justify-center px-4 py-20">
          <div className="max-w-4xl w-full mx-auto">
            <div className="flex flex-col lg:flex-row gap-6 lg:items-start">

              {/* Columna izquierda: card principal */}
              <div className="flex-1 min-w-0">
                <div
                  className={`${isDark ? "glass-dark" : "glass-light"} border-glow rounded-2xl p-6 sm:p-8 shadow-2xl`}
                >
                  {/* Card header */}
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Logo
                      src={LogoEvalIA}
                      containerClass="mx-auto mb-2 h-24 sm:h-28"
                      imgClass="w-80"
                    />

                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gradient-evalia">
                      Sorteo de números
                    </h1>

                    {/* Decorative tech badge */}
                    <span
                      className="font-mono text-xs border px-2 py-0.5 rounded"
                      style={{
                        borderColor: "var(--border-default)",
                        color: "var(--text-muted)",
                      }}
                    >
                      POWERED BY EVALIA
                    </span>

                    <p
                      className="text-sm max-w-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Ingresa el rango <span className="font-semibold">(N)</span> y la cantidad de ganadores{" "}
                      <span className="font-semibold">(K)</span>. Generaremos{" "}
                      <span className="font-semibold">K números únicos</span> entre{" "}
                      <span className="font-semibold">1</span> y <span className="font-semibold">N</span>.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">

                    {/* Fila 1: dos inputs lado a lado */}
                    <div className="grid grid-cols-2 gap-3">

                      {/* Input N */}
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor={inputId}
                          className="text-sm font-mono"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Número máximo (N)
                        </label>
                        <input
                          id={inputId}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Ej: 100"
                          value={form.max}
                          onChange={onChangeMax}
                          onBlur={() => setTouched(true)}
                          className={`h-12 w-full rounded-xl border font-mono text-lg px-4 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition ${formError ? "border-red-500/60" : "focus:border-[var(--border-glow)]"}`}
                          style={{
                            background: "var(--bg-input)",
                            color: "var(--text-primary)",
                            borderColor: formError ? undefined : "var(--border-default)",
                          }}
                          aria-describedby={formError ? `${inputId}-error` : undefined}
                          aria-invalid={formError ? true : undefined}
                        />
                        {formError && (
                          <p
                            id={`${inputId}-error`}
                            className="text-sm font-mono"
                            role="alert"
                            style={{ color: "rgb(248 113 113)" }}
                          >
                            {formError}
                          </p>
                        )}
                      </div>

                      {/* Input K */}
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor={countInputId}
                          className="text-sm font-mono"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Cantidad ganadores (K)
                        </label>
                        <input
                          id={countInputId}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Ej: 3"
                          value={form.count}
                          onChange={onChangeCount}
                          onBlur={() => setTouched(true)}
                          className={`h-12 w-full rounded-xl border font-mono text-lg px-4 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition ${countError ? "border-red-500/60" : "focus:border-[var(--border-glow)]"}`}
                          style={{
                            background: "var(--bg-input)",
                            color: "var(--text-primary)",
                            borderColor: countError ? undefined : "var(--border-default)",
                          }}
                          aria-describedby={countError ? `${countInputId}-error` : undefined}
                          aria-invalid={countError ? true : undefined}
                        />
                        {countError && (
                          <p
                            id={`${countInputId}-error`}
                            className="text-sm font-mono"
                            role="alert"
                            style={{ color: "rgb(248 113 113)" }}
                          >
                            {countError}
                          </p>
                        )}
                      </div>

                    </div>

                    {/* Fila 2: botón full width */}
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className={`h-12 w-full rounded-xl font-bold font-mono tracking-widest transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]
                        ${canSubmit
                          ? "bg-gradient-to-r from-evalia-700 to-evalia-500 text-white hover:from-evalia-600 hover:to-evalia-400 hover:glow-evalia cursor-pointer"
                          : "bg-evalia-800 text-white opacity-40 cursor-not-allowed"
                        }`}
                    >
                      {loading ? "[ SORTEANDO... ]" : "[ SORTEAR ]"}
                    </button>

                  </form>

                  {/* Global error */}
                  {error && (
                    <div
                      className={`mt-4 rounded-lg border px-4 py-3 text-sm font-mono ${
                        isDark
                          ? "border-red-500/40 bg-red-950/30 text-red-400"
                          : "border-red-300 bg-red-50 text-red-700"
                      }`}
                      role="alert"
                    >
                      {error}
                    </div>
                  )}

                  {/* Results section */}
                  <section aria-live="polite" className="mt-6">
                    <div
                      className="border-t my-4"
                      style={{ borderColor: "var(--border-default)" }}
                    />

                    <p
                      className="font-mono font-bold text-xs tracking-widest uppercase mb-4"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Resultados
                    </p>

                    {last ? (
                      <div className="grid gap-3">
                        {/* Timestamp + copy button row */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span
                            className="text-xs font-mono"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {new Date(last.timestamp).toLocaleString()}
                          </span>
                          <button
                            onClick={copyToClipboard}
                            className="rounded-lg border px-3 py-1.5 text-xs font-mono transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] hover:glow-evalia"
                            style={{
                              borderColor: "var(--border-default)",
                              background: "transparent",
                              color: copied ? "var(--accent)" : "var(--text-secondary)",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.borderColor =
                                "var(--border-glow)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.borderColor =
                                "var(--border-default)";
                            }}
                          >
                            {copied ? "[ COPIADO ]" : "[ COPIAR ]"}
                          </button>
                        </div>

                        {/* Number badges grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          {last.numbers.map((n) => (
                            <NumberBadge
                              key={n}
                              value={n}
                              isSelected={selected.has(n)}
                              onSelect={toggleSelect}
                            />
                          ))}
                        </div>

                        <p
                          className="text-xs font-mono"
                          style={{ color: "var(--text-muted)" }}
                        >
                          // Números únicos ordenados ascendentemente. Haz click para marcar ganadores.
                        </p>
                      </div>
                    ) : (
                      <p
                        className="text-sm font-mono"
                        style={{ color: "var(--text-muted)" }}
                      >
                        // Sin resultados aún. Ingresa los valores de{" "}
                        <strong style={{ color: "var(--text-secondary)" }}>N</strong>{" "}
                        y{" "}
                        <strong style={{ color: "var(--text-secondary)" }}>K</strong>{" "}
                        y presiona{" "}
                        <strong style={{ color: "var(--text-secondary)" }}>
                          [ SORTEAR ]
                        </strong>
                        .
                      </p>
                    )}
                  </section>
                </div>
              </div>

              {/* Columna derecha: panel ganadores */}
              <div className="w-full lg:w-72 xl:w-80 lg:sticky lg:top-24">
                <WinnersPanel
                  selected={selected}
                  maxWinners={countAsInt || 10}
                  onClear={clearSelected}
                  isDark={isDark}
                />
              </div>

            </div>
          </div>
        </main>

        {/* Footer */}
        <footer
          className="text-center text-xs font-mono py-4"
          style={{ color: "var(--text-muted)" }}
        >
          © EvalIA · Sorteo Seguro
        </footer>
      </div>
        {celebrating && (
          <>
            <CelebrationCanvas />
            <CelebrationOverlay
              winners={selected}
              maxWinners={countAsInt || 10}
              onClose={stopCelebration}
              isDark={isDark}
            />
          </>
        )}
    </div>
  );
}

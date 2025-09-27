import { useId, useMemo, useState } from "react";
import Logo from "./components/Logo";
import NumberBadge from "./components/NumberBadge";
import LogoEvalIA from "./assets/evalia.png";
import { useRandomDraw } from "./hooks/useRandomDraw";

interface FormState {
  max: string; // mantenemos como string para controlar input
}

export default function App() {
  const inputId = useId();
  const { loading, error, last, draw } = useRandomDraw();
  const [form, setForm] = useState<FormState>({ max: "" });
  const [touched, setTouched] = useState(false);

  const maxAsInt = useMemo(() => {
    const n = parseInt(form.max, 10);
    return Number.isFinite(n) ? n : NaN;
  }, [form.max]);

  const formError = useMemo(() => {
    if (!touched) return null;
    if (form.max.trim() === "") return "Requerido.";
    if (!Number.isInteger(maxAsInt)) return "Debe ser un número entero.";
    if (maxAsInt < 1) return "Debe ser ≥ 1.";
    return null;
  }, [touched, form.max, maxAsInt]);

  function onChangeMax(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((s) => ({ ...s, max: e.target.value.replace(/\D/g, "").slice(0, 9) })); // limita longitud y solo dígitos
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (formError) return;
    try {
      await draw(maxAsInt);
    } catch {
      // error ya lo maneja el hook
    }
  }

  const canSubmit = !loading && !formError && form.max.trim() !== "";

  async function copyToClipboard() {
    if (!last) return;
    const text = last.numbers.join(", ");
    try {
      await navigator.clipboard.writeText(text);
      alert("Resultados copiados al portapapeles.");
    } catch {
      alert("No se pudo copiar.");
    }
  }

  return (
    <main className="min-h-dvh bg-gradient-to-br from-sky-50 via-indigo-50 to-fuchsia-50 text-slate-800">
      <div className="container mx-auto px-4 py-10 flex items-center justify-center">
        <div className="w-full max-w-3xl">
          {/* Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl ring-1 ring-slate-200 p-6 sm:p-8">
            {/* Header */}
            <div className="flex flex-col items-center gap-4">
              <Logo
                src={LogoEvalIA}
                containerClass="mx-auto my-2 h-28 sm:h-32"
                imgClass="w-96"
              />
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Sorteo de 10 números
              </h1>
              <p className="text-sm sm:text-base text-slate-600 text-center">
                Ingresa un número máximo <span className="font-semibold">(N)</span>. Generaremos
                <span className="font-semibold"> 10 números únicos</span> entre <span className="font-semibold">1</span> y <span className="font-semibold">N</span>.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              <div className="grid sm:grid-cols-[1fr_auto] gap-3">
                <div className="grid gap-2">
                  <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
                    Cantidad máxima (N)
                  </label>
                  <input
                    id={inputId}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Ej: 100"
                    value={form.max}
                    onChange={onChangeMax}
                    onBlur={() => setTouched(true)}
                    className={`h-12 rounded-xl border px-4 text-lg bg-white/90
                               focus:outline-none focus:ring-4 transition
                               ${formError ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:ring-sky-100"}`}
                  />
                  {formError && (
                    <p className="text-sm text-red-600" role="alert">{formError}</p>
                  )}
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`h-12 w-full sm:w-40 rounded-xl font-semibold cursor-pointer
                                ${canSubmit ? "bg-evalia-600 hover:bg-evalia-700 text-white shadow-sm" : "bg-evalia-200 text-evalia-500 cursor-not-allowed"}
                                transition focus:outline-none focus:ring-4 focus:ring-evalia-200`}
                  >
                    {loading ? "Sorteando..." : "Sortear"}
                  </button>
                </div>
              </div>
            </form>

            {/* Error global del hook */}
            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Resultados */}
            <section
              aria-live="polite"
              className="mt-6"
            >
              {last ? (
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Resultados</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        {new Date(last.timestamp).toLocaleString()}
                      </span>
                      <button
                        onClick={copyToClipboard}
                        className="rounded-lg border border-slate-200 bg-white/70 px-3 py-1.5 text-sm hover:bg-white transition"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {last.numbers.map((n) => (
                      <NumberBadge key={n} value={n} />
                    ))}
                  </div>

                  <p className="text-xs text-slate-500">
                    * Se muestran números únicos ordenados ascendentemente para legibilidad.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Aún no hay resultados. Ingresa un valor en <strong>N</strong> y presiona <strong>Sortear</strong>.
                </p>
              )}
            </section>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-evalia-500">
            EvalIA
          </div>
        </div>
      </div>
    </main>
  );
}

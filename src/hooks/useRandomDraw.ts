import { useState } from "react";

export interface DrawResult {
  numbers: number[];
  timestamp: number; // ms since epoch
}

export interface UseRandomDraw {
  loading: boolean;
  error: string | null;
  last: DrawResult | null;
  draw: (maxInclusive: number, count?: number) => Promise<DrawResult>;
}

function secureRandomInt(maxExclusive: number): number {
  // 0..maxExclusive-1 usando rechazo para evitar sesgo
  if (maxExclusive <= 0) throw new Error("maxExclusive must be > 0");
  const maxUint32 = 0xFFFFFFFF;
  const limit = Math.floor((maxUint32 + 1) / maxExclusive) * maxExclusive; // múltiplo más cercano
  const buf = new Uint32Array(1);
  let x = 0;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % maxExclusive;
}

export function useRandomDraw(): UseRandomDraw {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<DrawResult | null>(null);

  async function draw(maxInclusive: number, count = 10): Promise<DrawResult> {
    setLoading(true);
    setError(null);
    try {
      if (!Number.isInteger(maxInclusive) || maxInclusive < 1) {
        throw new Error("Ingresa un número entero mayor o igual a 1.");
      }

      const k = Math.min(count, maxInclusive);
      const picked = new Set<number>();

      // muestreo sin reemplazo
      while (picked.size < k) {
        const n = secureRandomInt(maxInclusive) + 1; // 1..N
        picked.add(n);
      }

      // Ordenamos para legibilidad (aleatorio ya fue en la selección)
      const result = Array.from(picked.values()).sort((a, b) => a - b);
      const payload: DrawResult = { numbers: result, timestamp: Date.now() };
      setLast(payload);
      return payload;
    } catch (e: any) {
      setError(e?.message ?? "Error generando el sorteo.");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, last, draw };
}
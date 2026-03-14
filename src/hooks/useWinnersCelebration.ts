import { useState, useEffect, useRef, useCallback } from "react";

interface UseCelebration {
  celebrating: boolean;
  stopCelebration: () => void;
}

export function useWinnersCelebration(selectedCount: number, maxWinners: number): UseCelebration {
  const [celebrating, setCelebrating] = useState(false);
  const prevRef = useRef<number>(selectedCount);

  const stopCelebration = useCallback(() => {
    setCelebrating(false);
  }, []);

  useEffect(() => {
    const prev = prevRef.current;

    if (maxWinners > 0 && selectedCount === maxWinners && prev < maxWinners) {
      setCelebrating(true);
    }

    prevRef.current = selectedCount;
  }, [selectedCount, maxWinners]);

  return { celebrating, stopCelebration };
}

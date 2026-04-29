"use client";

import { useEffect, useRef, useState } from "react";

export function useTweenNumber(target: number, durationMs = 200): number {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number>(target);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    startRef.current = valueRef.current;
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const nextValue = startRef.current + (target - startRef.current) * eased;
      valueRef.current = nextValue;
      setValue(nextValue);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, durationMs]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  return value;
}

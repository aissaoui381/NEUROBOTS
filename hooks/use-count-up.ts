'use client';

import { useState, useEffect, useRef } from 'react';

export function useCountUp(end: number, duration = 1500, start = 0) {
  const [count, setCount] = useState(start);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(start + (end - start) * ease));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    startTimeRef.current = null;
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration, start]);

  return count;
}

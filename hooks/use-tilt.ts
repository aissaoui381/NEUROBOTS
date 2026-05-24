'use client';

import { useRef, useCallback } from 'react';

interface TiltOptions {
  maxAngle?: number;
  perspective?: number;
  scale?: number;
}

export function useTilt({ maxAngle = 8, perspective = 1000, scale = 1.02 }: TiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const rotateX = -y * maxAngle;
    const rotateY = x * maxAngle;

    el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
    el.style.transition = 'transform 0.1s ease-out';
  }, [maxAngle, perspective, scale]);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    el.style.transition = 'transform 0.4s ease-out';
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}

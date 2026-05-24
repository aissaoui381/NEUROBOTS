'use client';

import { useEffect, useRef } from 'react';

interface ScrollRevealOptions {
  threshold?: number;
  delay?: number;
  translateY?: number;
  once?: boolean;
}

export function useScrollReveal({
  threshold = 0.12,
  delay = 0,
  translateY = 30,
  once = true,
}: ScrollRevealOptions = {}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.opacity = '0';
    el.style.transform = `translateY(${translateY}px)`;
    el.style.transition = `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            if (once) observer.unobserve(el);
          } else if (!once) {
            el.style.opacity = '0';
            el.style.transform = `translateY(${translateY}px)`;
          }
        });
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, delay, translateY, once]);

  return ref;
}

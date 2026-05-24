'use client';

import { useEffect, useRef } from 'react';

interface ParticleBgProps {
  count?: number;
  color?: string; // RGB triplet e.g. "14,165,255"
  opacity?: number;
  dist?: number;
  speed?: number;
}

export function ParticleBg({
  count = 50,
  color = '14,165,255',
  opacity = 0.55,
  dist = 115,
  speed = 0.22,
}: ParticleBgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let visible = true;
    const MOUSE_R = 125;
    const mouse = { x: -9999, y: -9999 };

    type Node = { x: number; y: number; vx: number; vy: number; fx: number; fy: number; pulse: number };
    const nodes: Node[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        fx: 0, fy: 0,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    const onTouch = (e: TouchEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - r.left;
      mouse.y = e.touches[0].clientY - r.top;
    };
    const onTouchEnd = () => { mouse.x = -9999; mouse.y = -9999; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    const observer = new IntersectionObserver(
      ([e]) => { visible = e.isIntersecting; },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const draw = () => {
      animId = requestAnimationFrame(draw);
      if (!visible) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Cursor glow
      if (mouse.x > 0 && mouse.x < canvas.width && mouse.y > 0 && mouse.y < canvas.height) {
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 105);
        g.addColorStop(0, `rgba(${color},${0.18 * opacity})`);
        g.addColorStop(0.45, `rgba(${color},${0.06 * opacity})`);
        g.addColorStop(1, `rgba(${color},0)`);
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 105, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      for (const n of nodes) {
        if (mouse.x > -100) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MOUSE_R && d > 0) {
            const f = (1 - d / MOUSE_R) * 0.55;
            n.fx += (dx / d) * f;
            n.fy += (dy / d) * f;
          }
        }
        n.fx *= 0.87;
        n.fy *= 0.87;
        n.x += n.vx + n.fx;
        n.y += n.vy + n.fy;
        n.pulse += 0.018;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      }

      // Lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < dist) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${color},${(1 - d / dist) * 0.2 * opacity})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Dots
      for (const n of nodes) {
        const r = 1.5 + Math.sin(n.pulse) * 0.55;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${0.52 * opacity})`;
        ctx.fill();
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [count, color, opacity, dist, speed]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full" suppressHydrationWarning />
    </div>
  );
}

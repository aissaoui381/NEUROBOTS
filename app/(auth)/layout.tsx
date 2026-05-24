'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let id: number;
    const nodes: Array<{ x: number; y: number; vx: number; vy: number }> = [];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 60; i++) nodes.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22 });
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const n of nodes) { n.x += n.vx; n.y += n.vy; if (n.x < 0 || n.x > canvas.width) n.vx *= -1; if (n.y < 0 || n.y > canvas.height) n.vy *= -1; }
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) { const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y); if (d < 120) { ctx.beginPath(); ctx.strokeStyle = `rgba(14,165,255,${(1 - d / 120) * .16})`; ctx.lineWidth = 1; ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke(); } }
      for (const n of nodes) { ctx.beginPath(); ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(14,165,255,0.35)'; ctx.fill(); }
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" suppressHydrationWarning />;
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      <ParticleCanvas />

      {/* Glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={{ width: 600, height: 600, top: '-15%', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(14,165,255,0.13) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{ width: 350, height: 350, bottom: '5%', right: '-5%', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{ width: 280, height: 280, bottom: '20%', left: '-4%', background: 'radial-gradient(circle, rgba(14,165,255,0.08) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2.5 font-display font-bold text-xl tracking-[-1px] text-[var(--text)]">
            <motion.span
              className="w-7 h-7 rounded-[7px] shrink-0"
              style={{ background: 'linear-gradient(135deg, #0EA5FF, #0a78ff)', boxShadow: '0 6px 20px -4px rgba(14,165,255,0.6)' }}
              animate={{ boxShadow: ['0 6px 20px -4px rgba(14,165,255,0.5)', '0 6px 28px -4px rgba(14,165,255,0.85)', '0 6px 20px -4px rgba(14,165,255,0.5)'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            Neurobots
          </Link>
        </motion.div>

        {children}
      </div>
    </div>
  );
}

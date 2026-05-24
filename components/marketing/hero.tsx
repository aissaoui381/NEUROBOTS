'use client';

import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThreeScene = lazy(() => import('./three-scene').then(m => ({ default: m.ThreeScene })));

const CHAT_SCRIPT = [
  { role: 'bot', text: "Hi! I'm the AI assistant for Hawthorne Roofing. Got a roofing question or need a quote? I can help right now." },
  { role: 'user', text: "My roof is leaking after the storm" },
  { role: 'bot', text: "That's urgent — storm damage needs attention fast. Can I get your name and the address?" },
  { role: 'user', text: "Mike Thompson, 412 Linden Rd" },
  { role: 'bot', text: "Thanks Mike! What's the best number to reach you? We can have someone out tomorrow morning." },
  { role: 'user', text: "555-0142" },
];

const CHAPTERS = ['Visitor', 'AI Replies', 'You Get Texted', 'Job Booked'];

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const COUNT = window.innerWidth < 768 ? 60 : 120;
    const DIST = 140;
    const MOUSE_R = 140;
    const mouse = { x: -9999, y: -9999 };

    const nodes: Array<{ x: number; y: number; vx: number; vy: number; fx: number; fy: number; pulse: number }> = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < COUNT; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        fx: 0,
        fy: 0,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    const onTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      mouse.x = t.clientX - rect.left;
      mouse.y = t.clientY - rect.top;
    };
    const onTouchEnd = () => { mouse.x = -9999; mouse.y = -9999; };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Cursor glow
      if (mouse.x > 0 && mouse.x < canvas.width && mouse.y > 0 && mouse.y < canvas.height) {
        const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 130);
        glow.addColorStop(0, 'rgba(14,165,255,0.22)');
        glow.addColorStop(0.45, 'rgba(14,165,255,0.07)');
        glow.addColorStop(1, 'rgba(14,165,255,0)');
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 130, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      // Update particles
      for (const n of nodes) {
        // Mouse repulsion force
        if (mouse.x > -100) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MOUSE_R && d > 0) {
            const f = (1 - d / MOUSE_R) * 0.65;
            n.fx += (dx / d) * f;
            n.fy += (dy / d) * f;
          }
        }
        // Decay force so particles settle back
        n.fx *= 0.87;
        n.fy *= 0.87;

        n.x += n.vx + n.fx;
        n.y += n.vy + n.fy;
        n.pulse += 0.02;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < DIST) {
            const alpha = (1 - d / DIST) * 0.25;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(14,165,255,${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const r = 2 + Math.sin(n.pulse) * 0.8;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(14,165,255,0.6)';
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" suppressHydrationWarning />;
}

function ChatDemo() {
  const [messages, setMessages] = useState<typeof CHAT_SCRIPT>([]);
  const [chapter, setChapter] = useState(0);
  const [showSms, setShowSms] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const delays = [800, 2200, 3600, 5000, 6600, 8000];

    const run = async () => {
      for (let i = 0; i < CHAT_SCRIPT.length; i++) {
        await new Promise(r => { timerRef.current = setTimeout(r, i === 0 ? delays[0] : delays[i] - delays[i - 1]); });
        if (cancelled) return;
        setMessages(prev => [...prev, CHAT_SCRIPT[i]]);
        if (i === 1) setChapter(1);
        if (i === 3) { setChapter(2); setTimeout(() => setShowSms(true), 300); setTimeout(() => { setShowNotif(true); }, 600); }
        if (i === 5) { setChapter(3); setTimeout(() => { setShowConfirm(true); }, 800); }
      }
      setTimeout(() => {
        if (cancelled) return;
        setMessages([]);
        setChapter(0);
        setShowSms(false);
        setShowNotif(false);
        setShowConfirm(false);
        run();
      }, 5000);
    };
    run();
    return () => { cancelled = true; if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div className="relative" style={{ perspective: '1800px', perspectiveOrigin: '50% 40%' }}>
      <div className="absolute inset-[-10%_-5%] pointer-events-none z-[-1]" style={{ background: 'radial-gradient(40% 40% at 80% 20%, rgba(14,165,255,0.25), transparent 70%), radial-gradient(40% 40% at 10% 80%, rgba(124,92,255,0.18), transparent 70%)', filter: 'blur(20px)' }} />

      {/* Phone mockup */}
      <div
        className="absolute -left-14 -bottom-20 w-[180px] h-[360px] rounded-[32px] p-3 z-[3] hidden lg:block"
        style={{
          background: 'linear-gradient(180deg, #1a1f33, #0a0c18)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 60px 120px -30px rgba(0,0,0,0.85), 0 0 0 6px #0a0c18 inset',
          transform: 'rotateY(14deg) rotateX(-2deg) rotateZ(-4deg) translateZ(20px)',
          animation: 'phone-float 6s ease-in-out infinite',
        }}
      >
        <div className="w-full h-full rounded-[22px] overflow-hidden relative" style={{ background: 'linear-gradient(180deg, #0e1120, #06080f)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[50px] h-[14px] rounded-[8px] bg-black z-10" />
          <div className="flex justify-between items-center px-4 pt-5 pb-1 text-[9px] font-mono font-semibold text-[var(--text)]">
            <span>9:41</span>
            <span className="text-[var(--muted)]">⚡ 📶</span>
          </div>
          <div className="mx-2 mt-3 bg-[rgba(255,255,255,0.06)] border border-[var(--border)] rounded-[12px] p-2.5 transition-all duration-500" style={{ opacity: showNotif ? 1 : 0, transform: showNotif ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(.95)' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-4 h-4 rounded-[4px] flex items-center justify-center text-[8px]" style={{ background: 'linear-gradient(135deg,#22C55E,#0EA5FF)' }}>💬</div>
              <span className="text-[8px] font-semibold text-[var(--text)] tracking-[0.04em]">NEUROBOTS</span>
              <span className="ml-auto text-[7px] text-[var(--muted)]">now</span>
            </div>
            <div className="text-[9px] font-semibold leading-[1.25] text-[var(--text)]">New lead — Mike T.</div>
            <div className="text-[8px] text-[rgba(238,240,255,0.7)] leading-[1.3] mt-0.5">Storm damage · urgent · 412 Linden Rd</div>
          </div>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute left-2.5 right-2.5 bottom-5 p-2.5 rounded-[10px] flex items-center gap-2"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)' }}
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] shrink-0 text-[#06250f]" style={{ background: 'var(--success)' }}>✓</div>
              <div>
                <div className="text-[9px] font-semibold text-[var(--success)]">Job booked ✓</div>
                <div className="text-[8px] text-[rgba(238,240,255,0.7)] mt-0.5">Customer notified</div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Browser */}
      <div className="float">
        <div className="rounded-[14px] overflow-hidden" style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)', boxShadow: '0 60px 120px -40px rgba(0,0,0,0.7), 0 30px 60px -30px rgba(14,165,255,0.25)', transform: 'rotateY(-12deg) rotateX(4deg)' }}>
          <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-[var(--border)]" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"/>
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]"/>
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]"/>
            </div>
            <div className="flex-1 flex items-center gap-2 bg-[var(--bg)] border border-[var(--border)] rounded-[6px] px-3 py-1.5 font-mono text-xs text-[rgba(238,240,255,0.7)] min-w-0">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span className="truncate">hawthorne-roofing.com</span>
            </div>
          </div>

          <div className="relative overflow-hidden" style={{ height: 430, background: 'radial-gradient(800px 300px at 80% -20%, rgba(14,165,255,0.18), transparent 60%), linear-gradient(180deg, #0b0e1a, #06080f)' }}>
            {/* Fake site */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-2 font-display font-bold text-sm">
                <div className="w-4 h-4 rounded-[4px]" style={{ background: 'linear-gradient(135deg,#22C55E,#0a78ff)' }} />
                Hawthorne Roofing
              </div>
              <div className="flex gap-3.5 text-[10px] text-[var(--muted)]"><span>Services</span><span>Gallery</span><span>About</span></div>
            </div>
            <div className="px-6">
              <div className="text-[10px] tracking-[0.12em] uppercase text-[var(--accent)] font-semibold">Family owned · since 2003</div>
              <div className="font-display font-extrabold text-[26px] leading-[1.05] tracking-[-1px] my-2">Roofs built<br/>to outlast the storm.</div>
              <div className="text-xs text-[rgba(238,240,255,0.7)] max-w-[36ch]">Free estimates across the Tri-State area. 5,000+ roofs replaced.</div>
              <div className="flex gap-2 mt-3">
                <span className="px-3 py-1.5 rounded-[6px] text-[11px] font-semibold text-[#06250f]" style={{ background: '#22C55E' }}>Get a free quote</span>
                <span className="px-3 py-1.5 rounded-[6px] text-[11px] border border-[var(--border-2)]">View our work</span>
              </div>
            </div>

            {/* SMS toast */}
            <motion.div
              initial={{ y: '-120%', opacity: 0 }}
              animate={showSms ? { y: '12px', opacity: 1 } : { y: '-120%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 24 }}
              className="absolute left-1/2 -translate-x-1/2 top-0 w-[280px] flex items-center gap-2.5 p-3 rounded-[14px] z-10"
              style={{ background: 'rgba(20,22,34,0.95)', backdropFilter: 'blur(16px)', border: '1px solid var(--border-2)', boxShadow: '0 20px 40px rgba(0,0,0,0.7)' }}
            >
              <div className="w-7 h-7 rounded-[7px] flex items-center justify-center text-sm shrink-0" style={{ background: 'linear-gradient(135deg,#22C55E,#0EA5FF)' }}>💬</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-[11px] font-semibold"><span>New lead — Mike T.</span><span className="text-[var(--muted)] font-normal">now</span></div>
                <div className="text-[10px] text-[rgba(238,240,255,0.7)] truncate mt-0.5">storm damage · urgent · 555-0142</div>
              </div>
            </motion.div>

            {/* Chat widget */}
            <div className="absolute right-4 bottom-4 w-64 rounded-[14px] overflow-hidden" style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)', boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(14,165,255,0.2)', transform: 'translateZ(60px)' }}>
              <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[var(--border)]" style={{ background: 'linear-gradient(180deg, rgba(14,165,255,0.12), transparent)' }}>
                <div className="w-6 h-6 rounded-full flex-shrink-0 relative" style={{ background: 'linear-gradient(135deg, var(--accent), #0a78ff)' }}>
                  <div className="absolute -right-[1px] -bottom-[1px] w-2 h-2 rounded-full bg-[var(--success)] border-2" style={{ borderColor: 'var(--bg-2)' }} />
                </div>
                <div>
                  <div className="text-xs font-semibold">Hawthorne AI</div>
                  <div className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] shadow-[0_0_4px_var(--success)]" />
                    replies in seconds
                  </div>
                </div>
              </div>
              <div className="p-3 flex flex-col gap-2 h-[200px] overflow-hidden relative">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                    className="max-w-[85%] px-2.5 py-2 rounded-xl text-xs leading-[1.4]"
                    style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      background: msg.role === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                      color: msg.role === 'user' ? '#06080F' : 'var(--text)',
                      fontWeight: msg.role === 'user' ? 500 : 400,
                      borderBottomRightRadius: msg.role === 'user' ? 4 : undefined,
                      borderBottomLeftRadius: msg.role === 'bot' ? 4 : undefined,
                    }}
                  >
                    {msg.text}
                  </motion.div>
                ))}
              </div>
              <div className="border-t border-[var(--border)] px-2.5 py-2 flex items-center gap-2 text-xs text-[var(--muted)]">
                <div className="flex-1 h-6 rounded-[6px] flex items-center px-2" style={{ background: 'rgba(255,255,255,0.04)' }}>Type a message…</div>
                <div className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[#06080F]" style={{ background: 'var(--accent)' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter indicator */}
      <div className="relative z-[10] flex gap-2 justify-center mt-6 flex-wrap">
        {CHAPTERS.map((ch, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border text-[10px] uppercase tracking-[0.08em] transition-all duration-300"
            style={{
              color: chapter === i ? 'var(--accent)' : 'var(--muted)',
              borderColor: chapter === i ? 'rgba(14,165,255,0.4)' : 'var(--border)',
              background: chapter === i ? 'var(--accent-dim)' : 'rgba(6,8,15,0.7)',
            }}
          >
            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono" style={{ background: chapter === i ? 'var(--accent)' : 'rgba(255,255,255,0.06)', color: chapter === i ? '#06080F' : 'var(--muted)' }}>
              {i + 1}
            </span>
            {ch}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <header className="relative min-h-screen pt-[120px] pb-16 overflow-hidden isolate">
      <div className="absolute inset-0 z-[-1]"><ParticleCanvas /></div>
      <Suspense fallback={null}>
        <ThreeScene className="absolute inset-0 z-[-1] pointer-events-none opacity-40" />
      </Suspense>
      <div className="absolute inset-0 z-[-1] pointer-events-none" style={{ background: 'radial-gradient(60% 50% at 80% 0%, rgba(14,165,255,0.18), transparent 70%), radial-gradient(50% 60% at 0% 100%, rgba(124,92,255,0.12), transparent 70%), linear-gradient(to bottom, transparent 60%, var(--bg) 100%)' }} />

      <div className="max-w-[1240px] mx-auto px-7 grid grid-cols-1 xl:grid-cols-2 gap-16 items-center">
        {/* Copy */}
        <div className="flex flex-col gap-0">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-[var(--accent)] border mb-5" style={{ background: 'var(--accent-dim)', borderColor: 'rgba(14,165,255,0.25)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping" style={{ boxShadow: '0 0 0 0 rgba(14,165,255,0.6)', animation: 'pulse 1.6s ease-out infinite' }} />
              2,847 leads captured this week
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.06 }}
            className="font-display font-extrabold text-[clamp(40px,6.2vw,84px)] leading-[1.05] tracking-[-2px] text-[var(--text)] mb-5"
          >
            Your leads don't wait.<br />
            <span style={{ color: 'var(--accent)' }}>Neither should you.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="text-[19px] text-[rgba(238,240,255,0.7)] leading-[1.6] max-w-[54ch] mb-7"
          >
            Neurobots is the AI lead concierge for home service contractors. It captures every visitor, qualifies them in seconds, and texts you the warm ones while you're still on the roof, in the truck, or under the sink.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="flex gap-3 flex-wrap mb-4"
          >
            <Link href="/sign-up">
              <Button size="lg" icon={<ArrowRight size={15} />}>Start free 7-day trial</Button>
            </Link>
            <Button variant="secondary" size="lg" icon={<Play size={13} />}>Watch 2-min demo</Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="flex items-center gap-3.5 flex-wrap text-xs text-[var(--muted)] mb-12"
          >
            {['No credit card', 'Setup in 10 minutes', 'Cancel anytime'].map((text, i) => (
              <span key={i} className="flex items-center gap-3.5">
                {text}
                {i < 2 && <span className="w-1 h-1 rounded-full bg-[var(--muted)]" />}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-3 gap-4 pt-6"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            {[['14', 'Leads today'], ['34s', 'Avg. response'], ['100%', 'Follow-up rate']].map(([num, lbl]) => (
              <div key={lbl}>
                <div className="font-display font-extrabold text-[36px] leading-none tracking-[-1px]" style={{ background: 'linear-gradient(180deg, #fff, #8aa6ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {num}
                </div>
                <div className="mt-1.5 text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">{lbl}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Demo scene */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <ChatDemo />
        </motion.div>
      </div>
    </header>
  );
}

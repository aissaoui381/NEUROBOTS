'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Copy, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateEmbedCode } from '@/lib/utils';

const CONFETTI_COLORS = ['#0EA5FF', '#7C3AED', '#22C55E', '#FF6835', '#F59E0B', '#EC4899'];

function Confetti() {
  const [pieces, setPieces] = useState<Array<{ id: number; x: number; color: string; delay: number; rot: number }>>([]);

  useEffect(() => {
    setPieces(Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 1.2,
      rot: Math.random() * 720,
    })));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: '110vh', rotate: p.rot, opacity: [1, 1, 0] }}
          transition={{ duration: 2.5, delay: p.delay, ease: 'easeIn' }}
          className="absolute w-2 h-3 rounded-sm"
          style={{ background: p.color, left: 0, top: 0 }}
        />
      ))}
    </div>
  );
}

const INSTALL_TABS = [
  {
    id: 'html',
    label: 'Manual HTML',
    instructions: [
      'Open your website\'s HTML source',
      'Find the closing </body> tag',
      'Paste the snippet just before it',
      'Save and publish your site',
    ],
  },
  {
    id: 'wordpress',
    label: 'WordPress',
    instructions: [
      'Go to Appearance → Theme File Editor',
      'Select your theme\'s footer.php',
      'Paste the snippet before </body>',
      'Click Update File',
    ],
  },
  {
    id: 'squarespace',
    label: 'Squarespace',
    instructions: [
      'Go to Settings → Advanced → Code Injection',
      'Paste the snippet into the Footer section',
      'Click Save',
      'Publish your site',
    ],
  },
];

export default function OnboardingStep3() {
  const router = useRouter();
  const [businessId, setBusinessId] = useState('');
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState('html');
  const [showConfetti, setShowConfetti] = useState(false);
  const shown = useRef(false);

  useEffect(() => {
    const id = sessionStorage.getItem('ob_business_id') ?? 'YOUR_BUSINESS_ID';
    setBusinessId(id);
    if (!shown.current) {
      shown.current = true;
      setTimeout(() => setShowConfetti(true), 300);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, []);

  const embedCode = generateEmbedCode(businessId);

  const copy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeTab = INSTALL_TABS.find(t => t.id === tab)!;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative">
      {showConfetti && <Confetti />}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(60% 60% at 50% 30%, rgba(14,165,255,0.1), transparent 70%)' }} />

      <div className="w-full max-w-2xl relative z-10">
        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'var(--accent)', color: '#06080F' }}>
                ✓
              </div>
              {s < 3 && <div className="h-px w-8" style={{ background: 'var(--accent)' }} />}
            </div>
          ))}
          <span className="ml-2 text-xs text-[var(--muted)] uppercase tracking-[0.06em]">Step 3 of 3</span>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4" style={{ background: 'var(--accent-dim)', border: '2px solid var(--accent)' }}>
            🎉
          </div>
          <h1 className="font-display font-extrabold text-4xl tracking-[-1.5px] text-[var(--text)] mb-2">
            You're all set!
          </h1>
          <p className="text-[var(--muted)] text-lg">Install the snippet on your site — your AI starts capturing leads immediately.</p>
        </motion.div>

        {/* Embed code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[16px] overflow-hidden mb-6"
          style={{ border: '1px solid var(--border-2)' }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ background: 'var(--bg-3)', borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"/><span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]"/><span className="w-2.5 h-2.5 rounded-full bg-[#28c840]"/>
              </div>
              <span className="text-xs font-mono text-[var(--muted)]">embed-snippet.html</span>
            </div>
            <Button variant="ghost" size="sm" icon={copied ? <Check size={13} className="text-[var(--success)]" /> : <Copy size={13} />} onClick={copy}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <pre className="p-5 text-sm font-mono text-[var(--accent)] overflow-x-auto" style={{ background: 'var(--bg-2)', lineHeight: 1.7 }}>
            {embedCode}
          </pre>
        </motion.div>

        {/* Install tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
          <div className="flex gap-2 mb-4 flex-wrap">
            {INSTALL_TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="px-3.5 py-1.5 rounded-[8px] text-sm font-medium transition-all"
                style={{
                  background: tab === t.id ? 'var(--accent-dim)' : 'var(--bg-2)',
                  color: tab === t.id ? 'var(--accent)' : 'var(--muted)',
                  border: `1px solid ${tab === t.id ? 'rgba(14,165,255,0.3)' : 'var(--border)'}`,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="rounded-[12px] p-5" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
            <ol className="flex flex-col gap-3">
              {activeTab.instructions.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[rgba(238,240,255,0.8)]">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(14,165,255,0.25)' }}>
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            size="lg"
            icon={<Sparkles size={16} />}
            className="flex-1 justify-center"
            onClick={() => window.open('https://calendly.com', '_blank')}
          >
            We'll install it for you
          </Button>
          <Button
            size="lg"
            iconRight={<ArrowRight size={16} />}
            className="flex-1 justify-center"
            onClick={() => router.push('/dashboard')}
          >
            Go to dashboard
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

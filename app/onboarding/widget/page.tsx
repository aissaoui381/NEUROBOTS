'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ACCENT_COLORS = ['#0EA5FF', '#7C3AED', '#22C55E', '#FF6835', '#F59E0B'];

const CHAT_PREVIEW = [
  { role: 'bot', text: (greeting: string) => greeting },
  { role: 'user', text: () => 'I need a roof inspection after the hail storm' },
  { role: 'bot', text: (_greeting: string, name: string) => `Got it! I'm ${name} and I can get someone out to you quickly. Can I get your name and address?` },
];

export default function OnboardingStep2() {
  const router = useRouter();
  const [aiName, setAiName] = useState('AI Assistant');
  const [greeting, setGreeting] = useState('Hi! I can get you a free quote in 60 seconds.');
  const [accent, setAccent] = useState('#0EA5FF');
  const [saving, setSaving] = useState(false);
  const [visibleMsgs, setVisibleMsgs] = useState(0);

  useEffect(() => {
    setVisibleMsgs(0);
    const timers = CHAT_PREVIEW.map((_, i) =>
      setTimeout(() => setVisibleMsgs(v => Math.max(v, i + 1)), (i + 1) * 1200)
    );
    return () => timers.forEach(clearTimeout);
  }, [greeting, aiName]);

  const handleContinue = async () => {
    setSaving(true);
    const businessId = sessionStorage.getItem('ob_business_id');
    if (businessId) {
      await fetch('/api/business', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: businessId, ai_name: aiName, ai_greeting: greeting, accent_color: accent }),
      });
    }
    router.push('/onboarding/install');
  };

  return (
    <div className="min-h-screen flex relative">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(60% 50% at 20% 50%, rgba(14,165,255,0.06), transparent 70%)' }} />

      <div className="flex-1 flex flex-col lg:flex-row relative z-10">
        {/* Left: Controls */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-8">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: s <= 2 ? 'var(--accent)' : 'var(--bg-2)',
                      color: s <= 2 ? '#06080F' : 'var(--muted)',
                      border: s <= 2 ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    {s <= 1 ? '✓' : s}
                  </div>
                  {s < 3 && <div className="h-px w-8" style={{ background: s < 2 ? 'var(--accent)' : 'var(--border)' }} />}
                </div>
              ))}
              <span className="ml-2 text-xs text-[var(--muted)] uppercase tracking-[0.06em]">Step 2 of 3</span>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-display font-extrabold text-3xl tracking-[-1px] text-[var(--text)] mb-1">Configure your AI</h1>
              <p className="text-[var(--muted)] mb-8">Customize how your AI greets and responds to visitors.</p>

              <div className="flex flex-col gap-5">
                <Input
                  label="AI assistant name"
                  value={aiName}
                  onChange={e => setAiName(e.target.value)}
                  placeholder="AI Assistant"
                />
                <Textarea
                  label="Opening greeting"
                  value={greeting}
                  onChange={e => setGreeting(e.target.value)}
                  placeholder="Hi! I can get you a free quote in 60 seconds."
                  className="min-h-[80px]"
                />

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em] block mb-2">Widget accent color</label>
                  <div className="flex gap-3">
                    {ACCENT_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setAccent(c)}
                        className="w-9 h-9 rounded-full transition-all duration-200 shrink-0"
                        style={{
                          background: c,
                          boxShadow: accent === c ? `0 0 0 3px var(--bg-2), 0 0 0 5px ${c}` : undefined,
                          transform: accent === c ? 'scale(1.15)' : undefined,
                        }}
                        aria-label={`Select color ${c}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <Button variant="secondary" size="lg" icon={<ArrowLeft size={16} />} onClick={() => router.push('/onboarding')}>
                    Back
                  </Button>
                  <Button size="lg" iconRight={<ArrowRight size={16} />} loading={saving} onClick={handleContinue} className="flex-1">
                    Get embed code
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right: Live preview */}
        <div className="flex-1 flex items-center justify-center p-8 lg:border-l lg:border-[var(--border)]" style={{ background: 'var(--bg-2)' }}>
          <div className="w-full max-w-sm">
            <div className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em] mb-4 text-center">Live preview</div>
            <div className="rounded-[16px] overflow-hidden border border-[var(--border-2)] shadow-2xl" style={{ background: 'var(--bg-2)' }}>
              {/* Widget header */}
              <div
                className="px-4 py-3.5 flex items-center gap-3"
                style={{ background: `linear-gradient(180deg, ${accent}22, transparent)`, borderBottom: '1px solid var(--border)' }}
              >
                <div className="w-8 h-8 rounded-full shrink-0 relative" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}88)` }}>
                  <div className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full bg-[var(--success)]" style={{ border: '2px solid var(--bg-2)' }} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--text)]">{aiName || 'AI Assistant'}</div>
                  <div className="text-xs text-[var(--muted)] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                    replies in seconds
                  </div>
                </div>
              </div>

              {/* Chat messages */}
              <div className="p-4 flex flex-col gap-3 min-h-[240px]">
                {CHAT_PREVIEW.slice(0, visibleMsgs).map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-[85%] px-3 py-2.5 rounded-[12px] text-sm leading-[1.45]"
                    style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      background: msg.role === 'user' ? accent : 'rgba(255,255,255,0.07)',
                      color: msg.role === 'user' ? '#06080F' : 'var(--text)',
                      fontWeight: msg.role === 'user' ? 500 : 400,
                      borderBottomRightRadius: msg.role === 'user' ? 4 : undefined,
                      borderBottomLeftRadius: msg.role === 'bot' ? 4 : undefined,
                    }}
                  >
                    {msg.text(greeting, aiName)}
                  </motion.div>
                ))}
              </div>

              {/* Input */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 h-10 rounded-[8px] px-3" style={{ background: 'var(--bg-3)', border: '1px solid var(--border)' }}>
                  <span className="flex-1 text-sm text-[var(--subtle)]">Type a message…</span>
                  <div className="w-6 h-6 rounded-[6px] flex items-center justify-center" style={{ background: accent }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={accent === '#F59E0B' ? '#000' : '#fff'} strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

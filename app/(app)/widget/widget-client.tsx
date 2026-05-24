'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Copy, Check, Send, RefreshCw, Code, Palette, Bot } from 'lucide-react';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { generateEmbedCode } from '@/lib/utils';
import type { Business } from '@/lib/supabase/types';

const ACCENT_COLORS = ['#0EA5FF', '#7C3AED', '#22C55E', '#FF6835', '#F59E0B', '#EC4899'];

interface TestMessage { role: 'user' | 'assistant'; text: string }

interface WidgetClientProps {
  business: Business;
}

const CHAT_PREVIEW_MSGS = [
  { role: 'bot' as const, text: (greeting: string) => greeting },
  { role: 'user' as const, text: () => 'I need a roof inspection after the hail storm' },
  { role: 'bot' as const, text: (_: string, name: string) => `Got it! I'm ${name} and I can help you quickly. Can I get your name and best callback number?` },
];

export function WidgetClient({ business }: WidgetClientProps) {
  const { toast } = useToast();
  const [aiName, setAiName] = useState(business.ai_name);
  const [greeting, setGreeting] = useState(business.ai_greeting);
  const [accent, setAccent] = useState(business.accent_color);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'preview' | 'test'>('preview');

  // Preview animation
  const [visibleMsgs, setVisibleMsgs] = useState(0);
  useEffect(() => {
    setVisibleMsgs(0);
    const timers = CHAT_PREVIEW_MSGS.map((_, i) =>
      setTimeout(() => setVisibleMsgs(v => Math.max(v, i + 1)), (i + 1) * 1200)
    );
    return () => timers.forEach(clearTimeout);
  }, [greeting, aiName]);

  // Test chat
  const [testMessages, setTestMessages] = useState<TestMessage[]>([]);
  const [testInput, setTestInput] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [testMessages]);

  const startTest = () => {
    setTestMessages([{ role: 'assistant', text: greeting }]);
    setTestStarted(true);
  };

  const resetTest = () => {
    setTestMessages([]);
    setTestInput('');
    setTestStarted(false);
    setTestLoading(false);
  };

  const sendTestMessage = async () => {
    if (!testInput.trim() || testLoading) return;
    const userText = testInput.trim();
    setTestInput('');

    const newHistory: TestMessage[] = [...testMessages, { role: 'user', text: userText }];
    setTestMessages(newHistory);
    setTestLoading(true);

    try {
      const res = await fetch(`/api/widget/${business.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
        }),
      });
      const data = await res.json();
      setTestMessages(prev => [...prev, { role: 'assistant', text: data.message }]);
      if (data.leadCaptured) {
        toast({ type: 'lead', title: 'Lead captured!', description: 'Test lead was created successfully.' });
      }
    } catch {
      setTestMessages(prev => [...prev, { role: 'assistant', text: 'Error — check your API key and try again.' }]);
    } finally {
      setTestLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/business', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: business.id, ai_name: aiName, ai_greeting: greeting, accent_color: accent }),
      });
      if (!res.ok) throw new Error();
      toast({ type: 'success', title: 'Saved!', description: 'Widget settings updated.' });
    } catch {
      toast({ type: 'error', title: 'Save failed', description: 'Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateEmbedCode(business.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const embedCode = generateEmbedCode(business.id);

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl tracking-tight text-[var(--text)]">Widget</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Configure your AI and get your embed code</p>
        </div>
        <Button size="sm" icon={<Save size={14} />} loading={saving} onClick={handleSave}>
          Save changes
        </Button>
      </motion.div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Left: Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-5 lg:w-[340px] shrink-0"
        >
          {/* AI Personality */}
          <div className="rounded-[14px] p-5 flex flex-col gap-4" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Bot size={14} className="text-[var(--accent)]" />
              <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em]">AI Personality</span>
            </div>
            <Input
              label="Assistant name"
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
          </div>

          {/* Accent color */}
          <div className="rounded-[14px] p-5" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Palette size={14} className="text-[var(--accent)]" />
              <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em]">Widget color</span>
            </div>
            <div className="flex gap-3 items-center">
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
                  aria-label={c}
                />
              ))}
              <input
                type="color"
                value={accent}
                onChange={e => setAccent(e.target.value)}
                className="w-9 h-9 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                title="Custom color"
              />
            </div>
          </div>

          {/* Embed code */}
          <div className="rounded-[14px] overflow-hidden" style={{ border: '1px solid var(--border-2)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ background: 'var(--bg-3)', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <Code size={13} className="text-[var(--muted)]" />
                <span className="text-xs font-mono text-[var(--muted)]">embed-snippet.html</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={copied ? <Check size={12} className="text-[var(--success)]" /> : <Copy size={12} />}
                onClick={handleCopy}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <pre
              className="p-4 text-xs font-mono text-[var(--accent)] overflow-x-auto"
              style={{ background: 'var(--bg-2)', lineHeight: 1.7 }}
            >
              {embedCode}
            </pre>
          </div>
        </motion.div>

        {/* Right: Preview / Test */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex-1 flex flex-col"
        >
          {/* Tabs */}
          <div className="flex gap-1 mb-4 p-1 rounded-[10px] w-fit" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
            {(['preview', 'test'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-1.5 rounded-[8px] text-sm font-medium capitalize transition-all"
                style={{
                  background: tab === t ? 'var(--bg)' : 'transparent',
                  color: tab === t ? 'var(--text)' : 'var(--muted)',
                  boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.3)' : undefined,
                }}
              >
                {t === 'preview' ? 'Live preview' : 'Test AI'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'preview' ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="flex-1 flex items-start justify-center"
              >
                <div className="w-full max-w-[380px]">
                  <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em] mb-4 text-center">Widget preview</p>
                  <div className="rounded-[20px] overflow-hidden shadow-2xl" style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)' }}>
                    {/* Header */}
                    <div
                      className="px-4 py-3.5 flex items-center gap-3"
                      style={{ background: `linear-gradient(180deg, ${accent}18, transparent)`, borderBottom: '1px solid var(--border)' }}
                    >
                      <div className="w-9 h-9 rounded-full shrink-0 relative" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}88)` }}>
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

                    {/* Messages */}
                    <div className="p-4 flex flex-col gap-3 min-h-[200px]">
                      {CHAT_PREVIEW_MSGS.slice(0, visibleMsgs).map((msg, i) => (
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
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={accent === '#F59E0B' ? '#000' : '#fff'} strokeWidth="2.5" strokeLinecap="round">
                            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="test"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="flex-1 flex flex-col"
              >
                <div className="w-full max-w-[420px] flex flex-col" style={{ height: 500 }}>
                  <div className="flex-1 rounded-[16px] flex flex-col overflow-hidden" style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)' }}>
                    {/* Chat header */}
                    <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}88)` }} />
                        <span className="text-sm font-semibold text-[var(--text)]">{aiName}</span>
                      </div>
                      <button
                        onClick={resetTest}
                        className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                      >
                        <RefreshCw size={11} />
                        Reset
                      </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                      {!testStarted ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3">
                          <p className="text-sm text-[var(--muted)] text-center">Test your AI in real-time</p>
                          <Button size="sm" onClick={startTest}>Start conversation</Button>
                        </div>
                      ) : (
                        <>
                          {testMessages.map((msg, i) => (
                            <div
                              key={i}
                              className="max-w-[85%] px-3 py-2.5 rounded-[12px] text-sm leading-relaxed"
                              style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                background: msg.role === 'user' ? accent : 'rgba(255,255,255,0.07)',
                                color: msg.role === 'user' ? '#06080F' : 'var(--text)',
                                fontWeight: msg.role === 'user' ? 500 : 400,
                                borderBottomRightRadius: msg.role === 'user' ? 4 : undefined,
                                borderBottomLeftRadius: msg.role === 'assistant' ? 4 : undefined,
                              }}
                            >
                              {msg.text}
                            </div>
                          ))}
                          {testLoading && (
                            <div className="flex gap-1.5 px-3 py-3 rounded-[12px] w-fit" style={{ background: 'rgba(255,255,255,0.07)', borderBottomLeftRadius: 4 }}>
                              {[0, 1, 2].map(i => (
                                <span
                                  key={i}
                                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                                  style={{ background: 'rgba(238,240,255,0.35)', animationDelay: `${i * 0.15}s` }}
                                />
                              ))}
                            </div>
                          )}
                          <div ref={chatEndRef} />
                        </>
                      )}
                    </div>

                    {/* Input */}
                    {testStarted && (
                      <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
                        <div className="flex items-center gap-2">
                          <input
                            value={testInput}
                            onChange={e => setTestInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTestMessage(); } }}
                            placeholder="Type a message to test…"
                            className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--subtle)] outline-none"
                            disabled={testLoading}
                          />
                          <button
                            onClick={sendTestMessage}
                            disabled={testLoading || !testInput.trim()}
                            className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-opacity disabled:opacity-30"
                            style={{ background: accent }}
                          >
                            <Send size={13} color={accent === '#F59E0B' ? '#000' : '#fff'} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

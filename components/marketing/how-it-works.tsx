'use client';

import { motion } from 'framer-motion';
import { SectionBg } from '@/components/marketing/section-bg';
import { ParticleBg } from '@/components/marketing/particle-bg';

const steps = [
  {
    num: '01',
    title: 'We install the widget.',
    desc: 'Paste one snippet — or have us do it for free. Neurobots reads your site, learns your services, your pricing, your service area. Live in 10 minutes.',
    art: (
      <svg viewBox="0 0 320 140" width="100%" height="100%">
        <defs><linearGradient id="g1" x1="0" x2="1"><stop offset="0" stopColor="#0EA5FF" stopOpacity="0"/><stop offset="1" stopColor="#0EA5FF" stopOpacity=".5"/></linearGradient></defs>
        <rect x="20" y="24" width="280" height="92" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)"/>
        <rect x="32" y="36" width="160" height="8" rx="2" fill="rgba(255,255,255,0.08)"/>
        <rect x="32" y="50" width="100" height="6" rx="2" fill="rgba(255,255,255,0.05)"/>
        <rect x="32" y="62" width="220" height="6" rx="2" fill="rgba(255,255,255,0.05)"/>
        <rect x="32" y="80" width="180" height="22" rx="6" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)"/>
        <text x="42" y="95" fontFamily="JetBrains Mono" fontSize="9" fill="#0EA5FF">{'<script src="neurobots.js">'}</text>
        <circle cx="270" cy="90" r="22" fill="#0EA5FF" opacity=".15"/>
        <circle cx="270" cy="90" r="14" fill="#0EA5FF"/>
        <path d="M264 90l4 4 8-8" stroke="#06080F" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'AI answers every lead, 24/7.',
    desc: 'Trained on your business. Knows what you charge, what you don\'t do, what counts as urgent. Books the visit, collects photos, confirms the address — all in your voice.',
    art: (
      <svg viewBox="0 0 320 140" width="100%" height="100%">
        <rect x="20" y="36" width="200" height="22" rx="11" fill="rgba(255,255,255,0.06)"/>
        <text x="32" y="51" fontFamily="DM Sans" fontSize="11" fill="#EEF0FF">"My roof is leaking…"</text>
        <rect x="100" y="68" width="200" height="22" rx="11" fill="#0EA5FF"/>
        <text x="112" y="83" fontFamily="DM Sans" fontSize="11" fill="#06080F" fontWeight="600">"That's urgent. I can get…"</text>
        <rect x="20" y="100" width="80" height="22" rx="11" fill="rgba(255,255,255,0.06)"/>
        <circle cx="34" cy="111" r="3" fill="#EEF0FF" opacity=".4"/>
        <circle cx="44" cy="111" r="3" fill="#EEF0FF" opacity=".7"/>
        <circle cx="54" cy="111" r="3" fill="#EEF0FF"/>
        <circle cx="280" cy="24" r="6" fill="#22C55E"/>
        <text x="218" y="28" fontFamily="DM Sans" fontSize="9" fill="rgba(238,240,255,0.5)">24/7 · ONLINE</text>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'You get a text. That\'s it.',
    desc: 'When a lead is qualified, ready, and on your calendar — your phone buzzes. One tap to confirm. The customer gets a polished follow-up. Your competitor never gets a chance.',
    art: (
      <div className="h-full flex flex-col p-2 gap-1.5">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)', fontSize: 10 }}>
          <div className="flex gap-1"><div className="w-1.5 h-1.5 rounded-full bg-white/20"/><div className="w-1.5 h-1.5 rounded-full bg-white/20"/><div className="w-1.5 h-1.5 rounded-full bg-white/20"/></div>
          <span className="flex-1 text-[var(--muted)] font-mono text-[9px]">Today · Live</span>
          <span className="flex items-center gap-1 text-[9px] font-bold text-[var(--success)] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}><span className="w-1 h-1 rounded-full bg-[var(--success)]"/>LIVE</span>
        </div>
        {[['Sarah K.', '$4,200', true], ['Mike T.', '$1,850', true], ['Reyes HVAC', '$8,600', false]].map(([name, val, shown], i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            whileInView={shown ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className="flex items-center gap-2 px-2.5 py-2 rounded-[6px] border"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)', fontSize: 10 }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] shrink-0"/>
            <span className="flex-1 text-[var(--text)] font-medium">{name}</span>
            <span className="font-mono text-[var(--success)] font-semibold">{val}</span>
          </motion.div>
        ))}
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="py-[72px] relative" id="how" style={{ background: 'linear-gradient(180deg, transparent, rgba(14,165,255,0.025), transparent)' }}>
      <SectionBg variant="blue" />
      <ParticleBg count={52} opacity={0.5} />
      <div className="max-w-[1240px] mx-auto px-7 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-[760px] mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-[0.06em] text-[var(--accent)] border" style={{ background: 'var(--accent-dim)', borderColor: 'rgba(14,165,255,0.25)' }}>
            How it works
          </span>
          <h2 className="font-display font-extrabold text-[clamp(34px,4.6vw,64px)] leading-[1.05] tracking-[-1.5px] text-[var(--text)] mt-[18px] mb-3.5">
            From visitor to booked job<br />in three steps.
          </h2>
          <p className="text-[19px] text-[rgba(238,240,255,0.7)] leading-[1.6] max-w-[54ch] mx-auto">
            No code. No new phone number. No "AI prompt engineering." You install one line, and Neurobots handles the rest forever.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-12">
          {steps.map((step, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="bg-[var(--bg-2)] border border-[var(--border)] rounded-[16px] p-8 relative overflow-hidden group"
              style={{ transition: 'border-color 0.25s, transform 0.25s, background 0.25s' }}
              whileHover={{ y: -4, borderColor: 'rgba(14,165,255,0.4)' }}
            >
              <div className="absolute left-0 right-0 top-[-1px] h-[2px] rounded-t-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'var(--accent)' }} />
              <div className="flex items-center gap-2.5 text-sm font-display font-extrabold text-[var(--accent)] mb-6 tracking-[0.06em]">
                Step {step.num}
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
              <div
                className="h-[140px] rounded-[10px] mb-6 overflow-hidden relative"
                style={{ background: 'radial-gradient(120% 80% at 0% 0%, rgba(14,165,255,0.15), transparent 60%), var(--bg)', border: '1px solid var(--border)' }}
              >
                {step.art}
              </div>
              <h3 className="font-display font-extrabold text-2xl leading-[1.1] tracking-[-1px] text-[var(--text)] mb-3">{step.title}</h3>
              <p className="text-[15px] text-[rgba(238,240,255,0.7)] leading-[1.55]">{step.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

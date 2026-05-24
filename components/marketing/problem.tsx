'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { X, CheckCircle, Clock } from 'lucide-react';
import { SectionBg } from '@/components/marketing/section-bg';
import { ParticleBg } from '@/components/marketing/particle-bg';

const withoutSteps = [
  { time: '2:14 pm', icon: '📞', state: 'bad', title: "Sarah's roof is leaking. She calls.", sub: "You're 30 ft up nailing flashing. Phone in the truck." },
  { time: '2:18 pm', icon: '🔇', state: 'bad', title: 'Voicemail. She doesn\'t leave one.', sub: 'Hangs up after 3 rings.' },
  { time: '2:21 pm', icon: '🔍', state: 'bad', title: 'She googles "roofer near me."', sub: 'Calls the next four. Two pick up.' },
  { time: '5:30 pm', icon: '💸', state: 'lost', title: 'Lead lost. — $4,200 walked away.', sub: "You'll never know she called." },
];

const withSteps = [
  { time: '2:14 pm', icon: '⚡', state: 'good', title: 'Sarah opens chat. AI replies in 34s.', sub: '"Storm damage? I\'ll get someone out tomorrow morning."' },
  { time: '2:15 pm', icon: '📱', state: 'good', title: 'You get a text. Lead qualified, photos attached.', sub: 'Tap once to confirm. Sarah gets a calendar invite.' },
  { time: 'tomorrow', icon: '✓', state: 'won', title: 'Job won. — $4,200 in the bank.', sub: 'She refers her neighbor a week later.' },
];

function TimelineItem({ item, i }: { item: typeof withoutSteps[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const borderColor = item.state === 'lost' ? 'var(--orange)' : item.state === 'won' ? 'var(--success)' : item.state === 'good' ? 'var(--accent)' : 'var(--orange)';
  const bg = item.state === 'lost' ? 'rgba(255,104,53,0.06)' : item.state === 'won' ? 'rgba(34,197,94,0.06)' : 'var(--bg-2)';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-start gap-3.5 rounded-[10px] p-3.5 border border-[var(--border)]"
      style={{ background: bg, borderLeft: `3px solid ${borderColor}` }}
    >
      <div className="font-mono text-xs text-[var(--muted)] w-14 shrink-0 pt-0.5">{item.time}</div>
      <div className="w-8 h-8 rounded-[8px] flex items-center justify-center text-sm shrink-0" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[var(--text)]">{item.title}</div>
        <div className="text-xs text-[var(--muted)] mt-0.5">{item.sub}</div>
      </div>
    </motion.div>
  );
}

export function Problem() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-[72px] relative" id="problem">
      <SectionBg variant="warm" />
      <ParticleBg count={48} opacity={0.5} />
      <div className="max-w-[1240px] mx-auto px-7 grid grid-cols-1 lg:grid-cols-2 gap-[80px] items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-[0.06em] text-[var(--accent)] border" style={{ background: 'var(--accent-dim)', borderColor: 'rgba(14,165,255,0.25)' }}>
            The problem
          </span>
          <h2 className="font-display font-extrabold text-[clamp(34px,4.6vw,64px)] leading-[1.05] tracking-[-1.5px] text-[var(--text)] mt-[18px] mb-[22px]">
            While you're on the roof,<br />they call your <span style={{ color: 'var(--orange)' }}>competition</span>.
          </h2>
          <p className="text-[19px] text-[rgba(238,240,255,0.7)] leading-[1.6] max-w-[54ch]">
            78% of home service leads go to whoever calls back first. If a homeowner waits more than 5 minutes, your odds drop by 80%. You can't be on the roof and on the phone — but Neurobots can.
          </p>
          <ul className="mt-6 flex flex-col gap-3.5">
            {[
              'The average contractor misses 62% of inbound leads after hours.',
              'Voicemails convert at under 4%. Text replies under 60s convert at 39%.',
              'A single missed storm-damage lead is worth $4,200–$12,000 in revenue.',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 items-start text-sm text-[rgba(238,240,255,0.7)]">
                <X size={16} className="shrink-0 mt-0.5 text-[var(--orange)]" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <div ref={ref} className="flex flex-col gap-3">
          <div className="flex items-center gap-3 py-1.5">
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
            <span className="text-xs text-[var(--muted)] uppercase tracking-[0.1em]">Without Neurobots</span>
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          </div>
          {withoutSteps.map((item, i) => <TimelineItem key={i} item={item} i={i} />)}
          <div className="flex items-center gap-3 py-1.5 mt-2">
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
            <span className="text-xs text-[var(--muted)] uppercase tracking-[0.1em]">With Neurobots</span>
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          </div>
          {withSteps.map((item, i) => <TimelineItem key={i} item={item} i={i + 4} />)}
        </div>
      </div>
    </section>
  );
}

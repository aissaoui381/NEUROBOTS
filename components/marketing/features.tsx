'use client';

import { motion } from 'framer-motion';
import { Mic2, Activity, BarChart2, Star } from 'lucide-react';
import { SectionBg } from '@/components/marketing/section-bg';
import { ParticleBg } from '@/components/marketing/particle-bg';

const features = [
  {
    icon: <Mic2 size={22} />,
    title: 'AI that knows your business.',
    desc: "Trained on your site, your reviews, your pricing sheets. It won't quote a metal roof you don't install or promise next-day in a snowstorm.",
  },
  {
    icon: <Activity size={22} />,
    title: 'Instant follow-up sequences.',
    desc: 'Lead ghosted you? Neurobots nudges them at 1h, 1d, 3d — by SMS and email — until they book or unsubscribe. Recovers ~22% of cold leads.',
  },
  {
    icon: <BarChart2 size={22} />,
    title: 'Lead dashboard worth opening.',
    desc: 'Every lead, every conversation, every dollar. Filter by service, ZIP, urgency. Export to CSV or pipe to your CRM.',
  },
  {
    icon: <Star size={22} />,
    title: 'Automatic review requests.',
    desc: 'Job done? We text the customer 48 hours later, route 5★ to Google, and quietly route 1–4★ to you first. Avg. +4.6 reviews per month.',
  },
];

export function Features() {
  return (
    <section className="py-[72px] relative" id="features">
      <SectionBg variant="green" />
      <ParticleBg count={48} color="34,197,94" opacity={0.4} />
      <div className="max-w-[1240px] mx-auto px-7 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-[760px] mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-[0.06em] text-[var(--accent)] border" style={{ background: 'var(--accent-dim)', borderColor: 'rgba(14,165,255,0.25)' }}>
            What you get
          </span>
          <h2 className="font-display font-extrabold text-[clamp(34px,4.6vw,64px)] leading-[1.05] tracking-[-1.5px] text-[var(--text)] mt-[18px] mb-3.5">
            Built for the trades.<br />Not a chatbot wrapper.
          </h2>
          <p className="text-[19px] text-[rgba(238,240,255,0.7)] leading-[1.6] max-w-[54ch] mx-auto">
            Every feature is shaped by 340+ real contractors who said: "Yeah, but does it actually work when I'm covered in shingles?"
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[18px] mt-12">
          {features.map((feat, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-[var(--bg-2)] border border-[var(--border)] rounded-[16px] p-6 flex flex-col gap-3.5 min-h-[240px] group relative overflow-hidden"
              whileHover={{ y: -4 }}
            >
              <div className="absolute left-0 right-0 top-[-1px] h-[2px] rounded-t-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'var(--accent)' }} />
              <div
                className="w-11 h-11 rounded-[10px] flex items-center justify-center text-[var(--accent)] overflow-hidden relative"
                style={{ background: 'var(--accent-dim)', border: '1px solid rgba(14,165,255,0.25)' }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[1.4s]" style={{ background: 'linear-gradient(180deg, transparent, rgba(14,165,255,0.25), transparent)', backgroundSize: '100% 200%', animation: 'feat-scan 4s ease-in-out infinite' }} />
                {feat.icon}
              </div>
              <h3 className="font-display font-extrabold text-xl leading-[1.15] tracking-[-0.5px] text-[var(--text)]">{feat.title}</h3>
              <p className="text-[14px] text-[rgba(238,240,255,0.7)] leading-[1.55]">{feat.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { SectionBg } from '@/components/marketing/section-bg';
import { ParticleBg } from '@/components/marketing/particle-bg';

const reviews = [
  { name: 'Dave R.', biz: 'R&R Roofing · Nashville, TN', avatar: '#0EA5FF', quote: "I was skeptical. Now it's booking jobs at 2am while I sleep. Captured 3 leads last Sunday during a storm — I was on the couch.", rating: 5 },
  { name: 'Maria C.', biz: 'Cool Breeze HVAC · Phoenix, AZ', avatar: '#7C3AED', quote: "The AI actually knows when to say 'I'll have the owner call you' vs. when to book it directly. That intelligence surprised me.", rating: 5 },
  { name: 'Tom K.', biz: 'Kessler Electric · Cleveland, OH', avatar: '#FF6835', quote: "Competitor down the street has a receptionist. I have Neurobots. I'm capturing MORE leads at a fraction of the cost.", rating: 5 },
  { name: 'Lisa P.', biz: 'GreenScapes · Austin, TX', avatar: '#22C55E', quote: "Set it up in 12 minutes. First lead came in 2 hours later. That lead turned into a $6,800 job. ROI in 48 hours.", rating: 5 },
  { name: 'James W.', biz: 'Weston Plumbing · Denver, CO', avatar: '#0EA5FF', quote: "The follow-up sequences are gold. Had a lead ghost me — Neurobots sent 3 texts over 3 days and they booked. I never would've chased that.", rating: 5 },
  { name: 'Angela M.', biz: 'Premier Cleaning · Seattle, WA', avatar: '#7C3AED', quote: "My Google reviews went from 14 to 62 in 4 months. The automatic review requests after job completion are genius.", rating: 5 },
  { name: 'Bobby S.', biz: 'Summit Roofing · Charlotte, NC', avatar: '#FF6835', quote: "It qualified a lead as 'urgent storm damage' before I even saw the notification. The estimate I sent closed same-day. Wild.", rating: 5 },
  { name: 'Sarah T.', biz: 'True Temp HVAC · Miami, FL', avatar: '#22C55E', quote: "I was paying $2,400/mo for a lead gen service. Now I pay $199 and convert 3x more because the AI responds instantly.", rating: 5 },
  { name: 'Rick H.', biz: 'H&H Landscaping · Dallas, TX', avatar: '#0EA5FF', quote: "Dead serious: I turned it on before going on vacation. Came back to 11 qualified leads and 3 booked jobs. Zero effort from me.", rating: 5 },
  { name: 'Patricia L.', biz: 'Luxe Clean Pro · Boston, MA', avatar: '#7C3AED', quote: "The widget matched our brand perfectly. Customers have NO idea it's AI — they think we have a very fast, very friendly person on chat 24/7.", rating: 5 },
  { name: 'Carlos V.', biz: 'Voltage Electric · San Antonio', avatar: '#FF6835', quote: "Customer said our chat response 'felt human.' Been using it 6 months. Never had a complaint. The AI just... gets it.", rating: 5 },
  { name: 'Wendy B.', biz: 'BrightHome Remodeling · Atlanta', avatar: '#22C55E', quote: "I was losing 70% of my leads to voicemail. Now that number is basically zero. The ROI math is embarrassingly obvious.", rating: 5 },
];

const row1 = [...reviews.slice(0, 6), ...reviews.slice(0, 6)];
const row2 = [...reviews.slice(6), ...reviews.slice(6)];

function ReviewCard({ r }: { r: typeof reviews[0] }) {
  return (
    <div
      className="w-[360px] shrink-0 flex flex-col gap-3.5 p-6 rounded-[16px] border transition-all duration-250"
      style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-2)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
    >
      <div className="flex gap-0.5">
        {Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={14} className="text-[#FFC857] fill-current" />)}
      </div>
      <p className="text-[15px] leading-[1.55] text-[var(--text)] font-medium tracking-[-0.01em]">
        <span className="font-display text-3xl text-[var(--accent)] leading-none align-[-10px] mr-1 opacity-60">"</span>
        {r.quote}
      </p>
      <div className="flex items-center gap-3 mt-auto pt-2 border-t border-[var(--border)]">
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-extrabold text-sm text-[#06080F] shrink-0" style={{ background: r.avatar }}>
          {r.name[0]}
        </div>
        <div>
          <div className="text-sm font-semibold text-[var(--text)] leading-[1.2]">{r.name}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">{r.biz}</div>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[10px] text-[var(--muted)] uppercase tracking-[0.06em]">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google
        </div>
      </div>
    </div>
  );
}

export function Reviews() {
  return (
    <section className="py-[72px] overflow-hidden relative" id="reviews">
      <SectionBg variant="mixed" />
      <ParticleBg count={44} color="124,92,237" opacity={0.4} />
      <div className="max-w-[1240px] mx-auto px-7 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-[760px] mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-[0.06em] text-[var(--accent)] border" style={{ background: 'var(--accent-dim)', borderColor: 'rgba(14,165,255,0.25)' }}>
            Loved by contractors
          </span>
          <h2 className="font-display font-extrabold text-[clamp(34px,4.6vw,64px)] leading-[1.05] tracking-[-1.5px] text-[var(--text)] mt-[18px] mb-8">
            340+ contractors swear by it.<br />
            <span style={{ color: 'var(--accent)' }}>A few of them said why.</span>
          </h2>
          <div className="flex justify-center items-center gap-6 flex-wrap">
            <div className="font-display font-extrabold text-[56px] leading-none tracking-[-2px]" style={{ background: 'linear-gradient(180deg, #fff, #FFC857)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>4.9</div>
            <div>
              <div className="flex gap-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={22} className="text-[#FFC857] fill-current" />)}</div>
              <div className="text-sm text-[rgba(238,240,255,0.7)] mt-1">From <strong className="text-[var(--text)]">412</strong> verified Google reviews</div>
            </div>
          </div>
        </motion.div>
      </div>

      <div
        className="flex flex-col gap-[18px] mt-12"
        style={{ maskImage: 'linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)', WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)' }}
      >
        <div className="flex gap-[18px] w-max" style={{ animation: 'review-slide 60s linear infinite' }}>
          {row1.map((r, i) => <ReviewCard key={i} r={r} />)}
        </div>
        <div className="flex gap-[18px] w-max" style={{ animation: 'review-slide 75s linear infinite reverse' }}>
          {row2.map((r, i) => <ReviewCard key={i} r={r} />)}
        </div>
      </div>

      <style>{`
        @keyframes review-slide { to { transform: translateX(-50%) } }
      `}</style>
    </section>
  );
}

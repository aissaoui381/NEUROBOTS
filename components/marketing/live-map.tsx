'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { ParticleBg } from '@/components/marketing/particle-bg';
import usStates from 'us-atlas/states-10m.json';

// [longitude, latitude] for continental US cities
const CITIES = [
  { name: 'Seattle',        state: 'WA', coords: [-122.33, 47.61] },
  { name: 'Portland',       state: 'OR', coords: [-122.68, 45.52] },
  { name: 'San Francisco',  state: 'CA', coords: [-122.42, 37.77] },
  { name: 'Los Angeles',    state: 'CA', coords: [-118.24, 34.05] },
  { name: 'San Diego',      state: 'CA', coords: [-117.16, 32.72] },
  { name: 'Las Vegas',      state: 'NV', coords: [-115.14, 36.17] },
  { name: 'Phoenix',        state: 'AZ', coords: [-112.07, 33.45] },
  { name: 'Salt Lake City', state: 'UT', coords: [-111.89, 40.76] },
  { name: 'Albuquerque',    state: 'NM', coords: [-106.65, 35.08] },
  { name: 'Denver',         state: 'CO', coords: [-104.99, 39.74] },
  { name: 'Minneapolis',    state: 'MN', coords: [-93.27, 44.98] },
  { name: 'Milwaukee',      state: 'WI', coords: [-87.91, 43.04] },
  { name: 'Chicago',        state: 'IL', coords: [-87.63, 41.88] },
  { name: 'Detroit',        state: 'MI', coords: [-83.05, 42.33] },
  { name: 'Kansas City',    state: 'MO', coords: [-94.58, 39.1]  },
  { name: 'St. Louis',      state: 'MO', coords: [-90.2,  38.63] },
  { name: 'Indianapolis',   state: 'IN', coords: [-86.16, 39.77] },
  { name: 'Louisville',     state: 'KY', coords: [-85.76, 38.25] },
  { name: 'Dallas',         state: 'TX', coords: [-96.8,  32.78] },
  { name: 'Houston',        state: 'TX', coords: [-95.37, 29.76] },
  { name: 'Austin',         state: 'TX', coords: [-97.74, 30.27] },
  { name: 'San Antonio',    state: 'TX', coords: [-98.49, 29.42] },
  { name: 'Memphis',        state: 'TN', coords: [-90.05, 35.15] },
  { name: 'Nashville',      state: 'TN', coords: [-86.78, 36.17] },
  { name: 'Columbus',       state: 'OH', coords: [-83.0,  39.96] },
  { name: 'Charlotte',      state: 'NC', coords: [-80.84, 35.23] },
  { name: 'Atlanta',        state: 'GA', coords: [-84.39, 33.75] },
  { name: 'Jacksonville',   state: 'FL', coords: [-81.66, 30.33] },
  { name: 'Tampa',          state: 'FL', coords: [-82.46, 27.95] },
  { name: 'Miami',          state: 'FL', coords: [-80.19, 25.77] },
  { name: 'Philadelphia',   state: 'PA', coords: [-75.16, 39.95] },
  { name: 'New York',       state: 'NY', coords: [-74.0,  40.71] },
  { name: 'Baltimore',      state: 'MD', coords: [-76.61, 39.29] },
  { name: 'Boston',         state: 'MA', coords: [-71.06, 42.36] },
  { name: 'Raleigh',        state: 'NC', coords: [-78.64, 35.78] },
];

const JOB_TYPES = [
  'Roof repair', 'HVAC tune-up', 'Plumbing leak', 'Electrical panel',
  'Storm damage', 'Drain cleaning', 'AC replacement', 'Water heater',
  'Foundation check', 'Window replacement', 'Fence repair', 'Drywall patch',
];

interface Lead {
  id: number;
  city: (typeof CITIES)[0];
  job: string;
  value: number;
  ts: number;
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeLead(): Lead {
  return {
    id: Date.now() + Math.random(),
    city: CITIES[rand(0, CITIES.length - 1)],
    job: JOB_TYPES[rand(0, JOB_TYPES.length - 1)],
    value: rand(650, 5200),
    ts: Date.now(),
  };
}

export function LiveMap() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeCityIdx, setActiveCityIdx] = useState<number | null>(null);
  const [total, setTotal] = useState(14_203);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const spawn = () => {
      const lead = makeLead();
      const idx = CITIES.indexOf(lead.city);
      setActiveCityIdx(idx);
      setLeads(prev => [lead, ...prev].slice(0, 7));
      setTotal(p => p + 1);
      setTimeout(() => setActiveCityIdx(null), 2200);
    };
    spawn();
    let timer: ReturnType<typeof setTimeout>;
    const loop = () => {
      timer = setTimeout(() => { spawn(); loop(); }, 2600 + rand(-600, 800));
    };
    loop();
    return () => clearTimeout(timer);
  }, []);

  function timeAgo(ts: number) {
    const s = Math.floor((now - ts) / 1000);
    if (s < 5) return 'just now';
    if (s < 60) return `${s}s ago`;
    return `${Math.floor(s / 60)}m ago`;
  }

  return (
    <section className="py-[72px] relative overflow-hidden" id="live">
      <SectionBg />
      <ParticleBg count={40} opacity={0.3} />

      <div className="max-w-[1240px] mx-auto px-7 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-[760px] mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.06em] border mb-4"
            style={{ color: 'var(--success)', background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" style={{ animation: 'pulse 1.4s ease-in-out infinite' }} />
            Live · right now
          </span>
          <h2 className="font-display font-extrabold text-[clamp(34px,4.6vw,64px)] leading-[1.05] tracking-[-1.5px] text-[var(--text)] mt-4 mb-4">
            Leads captured across<br />
            <span style={{ color: 'var(--accent)' }}>the United States.</span>
          </h2>
          <p className="text-[19px] text-[rgba(238,240,255,0.7)] leading-[1.6] max-w-[52ch] mx-auto">
            Every pulse is a contractor who would have missed that call. Watch it happen in real time.
          </p>
        </motion.div>

        {/* Map + Feed */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4"
        >
          {/* US Map */}
          <div
            className="relative rounded-[16px] overflow-hidden"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border-2)',
              boxShadow: '0 0 0 1px rgba(14,165,255,0.08) inset',
            }}
          >
            <ComposableMap
              projection="geoAlbersUsa"
              projectionConfig={{ scale: 860 }}
              width={800}
              height={480}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            >
              {/* State fills + borders */}
              <Geographies geography={usStates}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="rgba(14,165,255,0.04)"
                      stroke="rgba(14,165,255,0.18)"
                      strokeWidth={0.6}
                      style={{
                        default: { outline: 'none' },
                        hover:   { outline: 'none', fill: 'rgba(14,165,255,0.08)' },
                        pressed: { outline: 'none' },
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* City markers */}
              {CITIES.map((city, i) => {
                const isActive = activeCityIdx === i;
                return (
                  <Marker key={city.name} coordinates={city.coords as [number, number]}>
                    {/* Ripple rings */}
                    {isActive && (
                      <>
                        <motion.circle
                          key={`r1-${leads[0]?.id}`}
                          r={14}
                          fill="rgba(14,165,255,0.1)"
                          stroke="rgba(14,165,255,0.7)"
                          strokeWidth={1.2}
                          initial={{ scale: 0.3, opacity: 0.8 }}
                          animate={{ scale: 3.2, opacity: 0 }}
                          transition={{ duration: 1.6, ease: 'easeOut' }}
                          style={{ transformOrigin: '0 0' }}
                        />
                        <motion.circle
                          key={`r2-${leads[0]?.id}`}
                          r={14}
                          fill="none"
                          stroke="rgba(14,165,255,0.5)"
                          strokeWidth={0.8}
                          initial={{ scale: 0.3, opacity: 0.6 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          transition={{ duration: 1.1, delay: 0.18, ease: 'easeOut' }}
                          style={{ transformOrigin: '0 0' }}
                        />
                      </>
                    )}

                    {/* Dot */}
                    <circle
                      r={isActive ? 4.5 : 3}
                      fill={isActive ? '#0EA5FF' : 'rgba(14,165,255,0.5)'}
                      style={{
                        filter: isActive ? 'drop-shadow(0 0 5px rgba(14,165,255,0.9))' : 'none',
                        transition: 'all 0.25s ease',
                      }}
                    />

                    {/* City label */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.text
                          initial={{ opacity: 0, y: 3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -3 }}
                          transition={{ duration: 0.2 }}
                          x={7}
                          y={-3}
                          fontSize={7}
                          fontWeight={700}
                          fill="#0EA5FF"
                          style={{ pointerEvents: 'none', filter: 'drop-shadow(0 1px 3px rgba(6,8,15,0.9))' }}
                        >
                          {city.name}, {city.state}
                        </motion.text>
                      )}
                    </AnimatePresence>
                  </Marker>
                );
              })}
            </ComposableMap>

            {/* Bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3"
              style={{ background: 'linear-gradient(to top, rgba(13,16,32,0.95) 60%, transparent)', backdropFilter: 'blur(4px)' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--success)]" style={{ animation: 'pulse 1.5s ease-in-out infinite', boxShadow: '0 0 6px var(--success)' }} />
                <span className="font-mono text-xs font-semibold text-[var(--text)]">{total.toLocaleString()} leads captured today</span>
              </div>
              <span className="text-xs text-[var(--muted)]">47 states active</span>
            </div>
          </div>

          {/* Live feed */}
          <div
            className="flex flex-col rounded-[16px] overflow-hidden"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--success)]" style={{ boxShadow: '0 0 6px var(--success)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <span className="text-sm font-semibold text-[var(--text)]">Live feed</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full text-[var(--success)]"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                LIVE
              </span>
            </div>

            <div className="flex-1 p-2 flex flex-col gap-1.5 overflow-hidden">
              <AnimatePresence initial={false}>
                {leads.map((lead) => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: -18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0, padding: 0 }}
                    transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px]"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[var(--text)] truncate">{lead.job}</div>
                      <div className="text-[10px] text-[var(--muted)]">{lead.city.name}, {lead.city.state}</div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-xs font-mono font-semibold text-[var(--success)]">${lead.value.toLocaleString()}</span>
                      <span className="text-[9px] text-[var(--muted)]">{timeAgo(lead.ts)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {leads.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-xs text-[var(--muted)]">
                  Waiting for leads…
                </div>
              )}
            </div>

            <div className="px-4 py-3 shrink-0 text-center" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-xs text-[var(--muted)]">Updated in real time · powered by Neurobots</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SectionBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(34,197,94,0.07), transparent 70%), radial-gradient(ellipse 80% 50% at 50% 100%, rgba(14,165,255,0.06), transparent 70%)',
      }} />
    </div>
  );
}

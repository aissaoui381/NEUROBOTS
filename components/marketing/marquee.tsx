export function Marquee() {
  const items = [
    { em: '34s', text: 'avg response time' },
    { text: 'Roofers · HVAC · Electrical · Landscaping · Cleaning' },
    { em: '14,200+', text: 'leads captured this year' },
    { text: 'Trained on YOUR site — not generic' },
    { em: '22%', text: 'cold leads recovered' },
    { text: 'Sleep through a thunderstorm. Wake up to bookings.' },
  ];
  const doubled = [...items, ...items];

  return (
    <div
      className="relative overflow-hidden py-[18px]"
      aria-hidden="true"
      style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(14,165,255,0.03)',
        maskImage: 'linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%)',
      }}
    >
      <div className="flex gap-12 w-max" style={{ animation: 'marquee-scroll 38s linear infinite', fontFamily: 'Syne, sans-serif', fontWeight: 700, letterSpacing: '-0.5px', fontSize: 22, color: 'rgba(238,240,255,0.5)', alignItems: 'center' }}>
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3.5 whitespace-nowrap">
            {item.em ? (
              <>
                <span style={{ color: 'var(--accent)', fontSize: 18 }}>{item.em}</span>
                {' '}{item.text}
              </>
            ) : (
              item.text
            )}
            {i < doubled.length - 1 && (
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
            )}
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee-scroll { to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}

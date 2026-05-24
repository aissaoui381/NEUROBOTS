type BgVariant = 'blue' | 'purple' | 'green' | 'warm' | 'mixed';

const COLORS: Record<BgVariant, [string, string]> = {
  blue:   ['rgba(14,165,255,0.09)',  'rgba(14,165,255,0.06)'],
  purple: ['rgba(124,58,237,0.09)',  'rgba(124,58,237,0.06)'],
  green:  ['rgba(34,197,94,0.07)',   'rgba(34,197,94,0.05)'],
  warm:   ['rgba(14,165,255,0.09)',  'rgba(255,104,53,0.06)'],
  mixed:  ['rgba(14,165,255,0.08)',  'rgba(124,58,237,0.07)'],
};

export function SectionBg({ variant = 'blue' }: { variant?: BgVariant }) {
  const [top, btm] = COLORS[variant];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${top}, transparent 70%), radial-gradient(ellipse 80% 50% at 50% 100%, ${btm}, transparent 70%)`,
      }} />
    </div>
  );
}

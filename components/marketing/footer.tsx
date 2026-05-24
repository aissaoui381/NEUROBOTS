import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10" style={{ borderTop: '1px solid var(--border)', padding: '48px 0 32px' }}>
      <div className="max-w-[1240px] mx-auto px-7">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-lg tracking-[-1px] text-[var(--text)] mb-3">
              <span className="relative w-6 h-6 rounded-[6px] shrink-0" style={{ background: 'linear-gradient(135deg, #0EA5FF 0%, #0a78ff 100%)' }} />
              Neurobots
            </Link>
            <p className="text-sm text-[rgba(238,240,255,0.7)] leading-[1.6] max-w-[32ch]">
              The AI lead concierge built for home service contractors. Never miss a job again.
            </p>
          </div>

          {[
            { heading: 'Product', links: [['How it works', '#how'], ['Features', '#features'], ['Pricing', '#pricing'], ['Widget builder', '/widget']] },
            { heading: 'Company', links: [['About', '/about'], ['Blog', '/blog'], ['Careers', '/careers'], ['Press', '/press']] },
            { heading: 'Legal', links: [['Privacy', '/privacy'], ['Terms', '/terms'], ['Security', '/security'], ['GDPR', '/gdpr']] },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="text-xs uppercase tracking-[0.08em] text-[var(--muted)] mb-3.5 font-medium">{heading}</h4>
              <ul className="flex flex-col gap-2.5">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-[rgba(238,240,255,0.7)] hover:text-[var(--text)] transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap pt-6" style={{ borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--muted)' }}>
          <span suppressHydrationWarning>© {year} Neurobots.io. All rights reserved.</span>
          <div className="flex gap-3">
            {[
              { icon: 'X', href: 'https://twitter.com', label: 'Twitter' },
              { icon: 'in', href: 'https://linkedin.com', label: 'LinkedIn' },
              { icon: 'gh', href: 'https://github.com', label: 'GitHub' },
            ].map(({ icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                style={{ border: '1px solid var(--border)' }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

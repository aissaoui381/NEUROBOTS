import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...opts,
  }).format(new Date(date));
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date, { month: 'short', day: 'numeric' });
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

// Twilio rejects non-E.164. Always store and send in +1XXXXXXXXXX form (US-only for now).
export function toE164(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (phone.startsWith('+') && digits.length >= 10) return `+${digits}`;
  return null;
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}

export function exportLeadsCSV(leads: { name?: string | null; phone?: string | null; email?: string | null; job_type?: string | null; status: string; urgency: string; source: string; address?: string | null; created_at: string }[], filename = 'leads.csv') {
  const headers = ['Name', 'Phone', 'Email', 'Job Type', 'Status', 'Urgency', 'Source', 'Address', 'Created'];
  const rows = leads.map(l => [
    l.name ?? '', l.phone ?? '', l.email ?? '',
    l.job_type ?? '', l.status, l.urgency, l.source,
    l.address ?? '', new Date(l.created_at).toLocaleDateString('en-US'),
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function generateEmbedCode(businessId: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    'https://neurobots.vercel.app';
  return `<!-- Neurobots.io Lead Capture Widget -->
<script>
  (function(n,e,u,r){
    n.NeuroBots=n.NeuroBots||{};
    var s=e.createElement('script');
    s.src=u+'/widget.js?id='+r;
    s.async=true;
    e.head.appendChild(s);
  })(window,document,'${baseUrl}','${businessId}');
</script>`;
}

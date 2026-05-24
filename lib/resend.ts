import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}

const FROM = 'Neurobots.io <noreply@neurobots.io>';

export async function sendTrialEndingEmail(email: string, name: string, daysLeft: number) {
  return getResend().emails.send({
    from: FROM,
    to: email,
    subject: `⚡ ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left on your Neurobots trial`,
    html: `
      <div style="font-family:'DM Sans',Arial,sans-serif;max-width:560px;margin:0 auto;background:#06080F;color:#EEF0FF;padding:40px;border-radius:16px;">
        <h1 style="font-size:28px;font-weight:800;color:#EEF0FF;margin-bottom:8px;">
          Your trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}
        </h1>
        <p style="color:rgba(238,240,255,0.5);margin-bottom:24px;">
          Hi ${name}, don't lose your leads. Upgrade to keep your AI running 24/7.
        </p>
        <a href="https://neurobots.io/settings"
           style="display:inline-block;background:#0EA5FF;color:#06080F;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;">
          Upgrade Now →
        </a>
      </div>
    `,
  });
}

export async function sendPaymentFailedEmail(email: string, name: string) {
  return getResend().emails.send({
    from: FROM,
    to: email,
    subject: '⚠️ Payment failed — update your card to keep your AI online',
    html: `
      <div style="font-family:'DM Sans',Arial,sans-serif;max-width:560px;margin:0 auto;background:#06080F;color:#EEF0FF;padding:40px;border-radius:16px;">
        <h1 style="font-size:28px;font-weight:800;color:#FF6835;margin-bottom:8px;">
          Payment failed
        </h1>
        <p style="color:rgba(238,240,255,0.5);margin-bottom:24px;">
          Hi ${name}, your last payment didn't go through. Update your card to keep your AI capturing leads.
        </p>
        <a href="https://neurobots.io/settings"
           style="display:inline-block;background:#FF6835;color:white;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;">
          Update Payment Method →
        </a>
      </div>
    `,
  });
}

'use client';

import { SignUp } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export default function SignUpPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col items-center gap-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--success)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
          7 days free · No credit card
        </div>
        <h1 className="font-display font-extrabold text-2xl tracking-tight text-[var(--text)]">Start your free trial</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(238,240,255,0.65)' }}>7 days free. Join 2,400+ contractors capturing more leads.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.18, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        className="w-full"
      >
        <SignUp
          forceRedirectUrl="/onboarding"
          signInUrl="/sign-in"
          appearance={{
            variables: {
              colorPrimary: '#0EA5FF',
              colorBackground: '#0D1020',
              colorInputBackground: '#131829',
              colorInputText: '#EEF0FF',
              colorText: '#EEF0FF',
              colorTextSecondary: 'rgba(238,240,255,0.65)',
              colorNeutral: 'rgba(255,255,255,0.09)',
              borderRadius: '10px',
              fontFamily: '"DM Sans", sans-serif',
            },
            elements: {
              card: 'shadow-2xl',
              cardBox: 'bg-[#0D1020] border border-[rgba(255,255,255,0.08)] rounded-[18px] shadow-[0_32px_80px_rgba(0,0,0,0.6)]',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: '!bg-white !text-gray-900 !border-gray-200 hover:!bg-gray-50 !rounded-[10px] !font-medium !shadow-sm transition-all',
              socialButtonsBlockButtonText: '!text-gray-900 !font-medium',
              formFieldInput: '!bg-[#131829] !border !border-[rgba(255,255,255,0.08)] !text-[#EEF0FF] !rounded-[10px] focus:!border-[#0EA5FF] focus:!shadow-[0_0_0_3px_rgba(14,165,255,0.2)] transition-all',
              formFieldLabel: '!text-[rgba(238,240,255,0.75)] !font-medium',
              formButtonPrimary: '!bg-[#0EA5FF] !text-[#06080F] !font-semibold !rounded-[10px] hover:!bg-[#38B6FF] !shadow-[0_0_24px_rgba(14,165,255,0.35)] transition-all',
              footerActionLink: '!text-[#0EA5FF] hover:!text-[#38B6FF] !font-medium',
              footerActionText: '!text-[rgba(238,240,255,0.55)]',
              dividerLine: '!bg-[rgba(255,255,255,0.08)]',
              dividerText: '!text-[rgba(238,240,255,0.45)]',
              identityPreviewText: '!text-[#EEF0FF]',
              identityPreviewEditButton: '!text-[#0EA5FF]',
              formResendCodeLink: '!text-[#0EA5FF]',
              alertText: '!text-[rgba(238,240,255,0.8)]',
            },
          }}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="text-[11px] text-center"
        style={{ color: 'rgba(238,240,255,0.3)' }}
      >
        By signing up you agree to our Terms of Service and Privacy Policy
      </motion.p>
    </motion.div>
  );
}

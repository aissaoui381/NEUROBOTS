'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ServiceType } from '@/lib/supabase/types';

const schema = z.object({
  name: z.string().min(2, 'Business name is required'),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  phone: z.string().min(10, 'Enter a valid phone number'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  service_type: z.enum(['roofing', 'landscaping', 'hvac', 'electrical', 'cleaning'] as const),
});

type FormData = z.infer<typeof schema>;

const SERVICE_TYPES: { id: ServiceType; label: string; emoji: string; desc: string }[] = [
  { id: 'roofing', label: 'Roofing', emoji: '🏠', desc: 'Roof repairs & replacements' },
  { id: 'landscaping', label: 'Landscaping', emoji: '🌿', desc: 'Lawn care & outdoor design' },
  { id: 'hvac', label: 'HVAC', emoji: '❄️', desc: 'Heating, cooling & air quality' },
  { id: 'electrical', label: 'Electrical', emoji: '⚡', desc: 'Wiring, panels & lighting' },
  { id: 'cleaning', label: 'Cleaning', emoji: '✨', desc: 'Home & commercial cleaning' },
];

export default function OnboardingStep1() {
  const router = useRouter();
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.firstName ? `${user.firstName}'s Business` : '' },
  });

  const selectedService = watch('service_type');

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, email: user?.primaryEmailAddress?.emailAddress }),
      });
      if (!res.ok) throw new Error('Failed to save');
      const business = await res.json();
      sessionStorage.setItem('ob_business_id', business.id);
      router.push('/onboarding/widget');
    } catch {
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(60% 50% at 80% 0%, rgba(14,165,255,0.08), transparent 70%)' }} />

      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-lg">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    background: s === 1 ? 'var(--accent)' : 'var(--bg-2)',
                    color: s === 1 ? '#06080F' : 'var(--muted)',
                    border: s === 1 ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {s}
                </div>
                {s < 3 && <div className="h-px w-8" style={{ background: s < 1 ? 'var(--accent)' : 'var(--border)' }} />}
              </div>
            ))}
            <span className="ml-2 text-xs text-[var(--muted)] uppercase tracking-[0.06em]">Step 1 of 3</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-display font-extrabold text-3xl tracking-[-1px] text-[var(--text)] mb-1">
              Tell us about your business
            </h1>
            <p className="text-[var(--muted)] mb-8">This powers your AI and personalizes your widget.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <Input label="Business name" placeholder="Hawthorne Roofing" error={errors.name?.message} {...register('name')} />

              <div className="grid grid-cols-2 gap-4">
                <Input label="Phone number" placeholder="(555) 012-3456" type="tel" error={errors.phone?.message} {...register('phone')} />
                <Input label="Website" placeholder="https://yourbiz.com" error={errors.website?.message} {...register('website')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="City" placeholder="Nashville" error={errors.city?.message} {...register('city')} />
                <Input label="State" placeholder="TN" error={errors.state?.message} {...register('state')} />
              </div>

              {/* Service type */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em]">What type of contractor?</label>
                {errors.service_type && <p className="text-xs text-[var(--orange)]">Please select a service type</p>}
                <div className="grid grid-cols-5 gap-2">
                  {SERVICE_TYPES.map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setValue('service_type', st.id, { shouldValidate: true })}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-[12px] border text-center transition-all duration-200"
                      style={{
                        background: selectedService === st.id ? 'var(--accent-dim)' : 'var(--bg-2)',
                        borderColor: selectedService === st.id ? 'var(--accent)' : 'var(--border)',
                        boxShadow: selectedService === st.id ? '0 0 0 2px var(--accent-dim)' : undefined,
                      }}
                    >
                      <span className="text-2xl">{st.emoji}</span>
                      <span className="text-xs font-semibold text-[var(--text)] leading-tight">{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-[var(--orange)]">{error}</p>}

              <Button type="submit" size="lg" loading={saving} iconRight={<ArrowRight size={16} />} className="mt-2">
                Continue to widget setup
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

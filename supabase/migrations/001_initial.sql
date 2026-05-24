-- Neurobots.io Initial Schema
-- Run this in the Supabase SQL editor

create table businesses (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  name text not null,
  website text,
  phone text,
  email text,
  service_type text check (service_type in ('roofing', 'landscaping', 'hvac', 'electrical', 'cleaning')),
  city text,
  state text,
  ai_name text not null default 'AI Assistant',
  ai_greeting text not null default 'Hi! I can get you a free quote in 60 seconds.',
  accent_color text not null default '#0EA5FF',
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'trial' check (plan in ('trial', 'starter', 'pro', 'agency')),
  trial_ends_at timestamptz not null default now() + interval '7 days',
  created_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text,
  phone text,
  email text,
  job_type text,
  message text,
  address text,
  urgency text not null default 'medium' check (urgency in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost')),
  source text not null default 'widget' check (source in ('widget', 'referral', 'manual')),
  ai_summary text,
  follow_up_count int not null default 0,
  last_follow_up_at timestamptz,
  sms_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table automations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  trigger text not null check (trigger in ('new_lead', 'no_response_1h', 'no_response_1d', 'job_closed')),
  action text not null check (action in ('send_sms', 'send_email', 'notify_owner')),
  message_template text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  lead_id uuid references leads(id),
  requested_at timestamptz,
  completed boolean not null default false,
  rating int check (rating >= 1 and rating <= 5),
  created_at timestamptz not null default now()
);

-- Indexes for common queries
create index leads_business_id_idx on leads(business_id);
create index leads_status_idx on leads(status);
create index leads_created_at_idx on leads(created_at desc);
create index conversations_lead_id_idx on conversations(lead_id);
create index automations_business_id_idx on automations(business_id);

-- Enable realtime for live updates
alter publication supabase_realtime add table leads;
alter publication supabase_realtime add table conversations;

-- Row level security
alter table businesses enable row level security;
alter table leads enable row level security;
alter table conversations enable row level security;
alter table automations enable row level security;
alter table reviews enable row level security;

-- Businesses: users can only see and modify their own business
create policy "users own their business" on businesses
  for all using (clerk_user_id = auth.jwt() ->> 'sub');

-- Leads: accessible if owned by the authenticated user's business
create policy "business owns its leads" on leads
  for all using (
    business_id in (
      select id from businesses where clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Conversations: accessible if the lead belongs to the user's business
create policy "business owns its conversations" on conversations
  for all using (
    lead_id in (
      select l.id from leads l
      join businesses b on l.business_id = b.id
      where b.clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Automations: owned by business
create policy "business owns its automations" on automations
  for all using (
    business_id in (
      select id from businesses where clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Reviews: owned by business
create policy "business owns its reviews" on reviews
  for all using (
    business_id in (
      select id from businesses where clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Widget API: allow anonymous inserts to leads and conversations (service role bypasses RLS)
-- The widget API uses the service role key on the server side

-- Seed default automations for new businesses (called from app on onboarding)
create or replace function seed_default_automations(business_id_input uuid)
returns void as $$
begin
  insert into automations (business_id, name, trigger, action, message_template) values
    (
      business_id_input,
      'New lead SMS alert',
      'new_lead',
      'notify_owner',
      '🔥 New lead from Neurobots: {{name}} needs {{job_type}}. Phone: {{phone}}. Urgency: {{urgency}}.'
    ),
    (
      business_id_input,
      '1-hour follow-up',
      'no_response_1h',
      'send_sms',
      'Hi {{name}}, just following up on your {{job_type}} request. Still interested? Reply YES for a quote.'
    ),
    (
      business_id_input,
      '24-hour follow-up email',
      'no_response_1d',
      'send_email',
      'Hi {{name}}, we wanted to follow up on your {{job_type}} request from yesterday. We have availability this week!'
    ),
    (
      business_id_input,
      'Review request after job',
      'job_closed',
      'send_sms',
      'Hi {{name}}! Hope your {{job_type}} project went great. Would you mind leaving us a quick Google review? It helps us a lot! {{review_link}}'
    );
end;
$$ language plpgsql security definer;

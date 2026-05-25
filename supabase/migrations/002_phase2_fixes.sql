-- Phase 2 fixes: notification settings, 14-day trial, ensure seed function exists

alter table businesses
  add column if not exists notify_new_lead boolean not null default true,
  add column if not exists notify_daily_summary boolean not null default false,
  add column if not exists notify_followup boolean not null default true;

-- Bump trial default from 7 days to 14 days (matches marketing copy)
alter table businesses
  alter column trial_ends_at set default (now() + interval '14 days');

-- Re-create the seed function with the parameter name the app actually uses.
create or replace function seed_default_automations(p_business_id uuid)
returns void as $$
begin
  insert into automations (business_id, name, trigger, action, message_template) values
    (
      p_business_id,
      'New lead SMS alert',
      'new_lead',
      'notify_owner',
      '🔥 New lead from Neurobots: {{name}} needs {{job_type}}. Phone: {{phone}}. Urgency: {{urgency}}.'
    ),
    (
      p_business_id,
      '1-hour follow-up',
      'no_response_1h',
      'send_sms',
      'Hi {{name}}, just following up on your {{job_type}} request. Still interested? Reply YES for a quote.'
    ),
    (
      p_business_id,
      '24-hour follow-up email',
      'no_response_1d',
      'send_email',
      'Hi {{name}}, we wanted to follow up on your {{job_type}} request from yesterday. We have availability this week!'
    ),
    (
      p_business_id,
      'Review request after job',
      'job_closed',
      'send_sms',
      'Hi {{name}}! Hope your {{job_type}} project went great. Would you mind leaving us a quick Google review? It helps us a lot! {{review_link}}'
    );
end;
$$ language plpgsql security definer;

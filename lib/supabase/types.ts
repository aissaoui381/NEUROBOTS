export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ServiceType = 'roofing' | 'landscaping' | 'hvac' | 'electrical' | 'cleaning';
export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
export type LeadUrgency = 'low' | 'medium' | 'high' | 'urgent';
export type LeadSource = 'widget' | 'referral' | 'manual';
export type Plan = 'trial' | 'starter' | 'pro' | 'agency';
export type AutomationTrigger = 'new_lead' | 'no_response_1h' | 'no_response_1d' | 'job_closed';
export type AutomationAction = 'send_sms' | 'send_email' | 'notify_owner';
export type ConversationRole = 'user' | 'assistant';

export interface Business {
  id: string;
  clerk_user_id: string;
  name: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  service_type: ServiceType | null;
  city: string | null;
  state: string | null;
  ai_name: string;
  ai_greeting: string;
  accent_color: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: Plan;
  trial_ends_at: string;
  notify_new_lead?: boolean;
  notify_daily_summary?: boolean;
  notify_followup?: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  business_id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  job_type: string | null;
  message: string | null;
  address: string | null;
  urgency: LeadUrgency;
  status: LeadStatus;
  source: LeadSource;
  ai_summary: string | null;
  follow_up_count: number;
  last_follow_up_at: string | null;
  sms_sent: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  lead_id: string;
  role: ConversationRole;
  content: string;
  created_at: string;
}

export interface Automation {
  id: string;
  business_id: string;
  name: string;
  trigger: AutomationTrigger;
  action: AutomationAction;
  message_template: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  lead_id: string | null;
  requested_at: string | null;
  completed: boolean;
  rating: number | null;
  created_at: string;
}

export type BusinessInsert = Partial<Business> & { clerk_user_id: string; name: string };
export type BusinessUpdate = Partial<Omit<Business, 'id' | 'created_at' | 'clerk_user_id'>>;
export type LeadInsert = Partial<Lead> & { business_id: string };
export type LeadUpdate = Partial<Omit<Lead, 'id' | 'created_at' | 'business_id'>>;
export type ConversationInsert = Omit<Conversation, 'id' | 'created_at'>;
export type AutomationInsert = Partial<Automation> & { business_id: string; name: string; trigger: AutomationTrigger; action: AutomationAction };
export type AutomationUpdate = Partial<Omit<Automation, 'id' | 'created_at' | 'business_id'>>;

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: Business;
        Insert: BusinessInsert;
        Update: BusinessUpdate;
        Relationships: [];
      };
      leads: {
        Row: Lead;
        Insert: LeadInsert;
        Update: LeadUpdate;
        Relationships: [];
      };
      conversations: {
        Row: Conversation;
        Insert: ConversationInsert;
        Update: Partial<Omit<Conversation, 'id' | 'created_at'>>;
        Relationships: [];
      };
      automations: {
        Row: Automation;
        Insert: AutomationInsert;
        Update: AutomationUpdate;
        Relationships: [];
      };
      reviews: {
        Row: Review;
        Insert: Partial<Review> & { business_id: string };
        Update: Partial<Omit<Review, 'id' | 'created_at' | 'business_id'>>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

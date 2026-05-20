
-- ============ ENUMS ============
CREATE TYPE public.partner_type AS ENUM ('ca','advocate','mentor','workshop_speaker','cohort_lead');
CREATE TYPE public.ai_message_role AS ENUM ('user','assistant');
CREATE TYPE public.ai_model_used AS ENUM ('haiku','sonnet');
CREATE TYPE public.ai_tier AS ENUM ('free','pro');
CREATE TYPE public.service_type AS ENUM ('gst_registration','udyam','pvt_ltd_incorporation','llp_incorporation','roc_annual_filing','epf_setup','trademark_filing','fssai','compliance_subscription');
CREATE TYPE public.service_order_status AS ENUM ('created','paid','in_progress','completed','cancelled','refunded');
CREATE TYPE public.cohort_product_type AS ENUM ('mepsc_certification','return_to_work','pricing_workshop','mastermind');
CREATE TYPE public.cohort_screening_status AS ENUM ('pending','shortlisted','accepted','rejected','waitlisted');
CREATE TYPE public.cohort_payment_status AS ENUM ('not_sent','sent','paid','expired');
CREATE TYPE public.subscription_product AS ENUM ('ai_pro','alumni_community','compliance','circle_membership');
CREATE TYPE public.subscription_billing_cycle AS ENUM ('monthly','annual');
CREATE TYPE public.subscription_status AS ENUM ('active','paused','cancelled','past_due','trialing');

-- ============ TABLE 1: partners ============
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  partner_type public.partner_type NOT NULL,
  city text NOT NULL,
  state text,
  email text NOT NULL,
  phone_e164 text,
  whatsapp_number text,
  specialisations text[] NOT NULL DEFAULT '{}',
  commission_split_pct int NOT NULL DEFAULT 70,
  is_active boolean NOT NULL DEFAULT true,
  service_capacity jsonb NOT NULL DEFAULT '{}'::jsonb,
  agreement_signed_date date,
  bank_account_for_payouts jsonb NOT NULL DEFAULT '{}'::jsonb,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY partners_admin_all ON public.partners FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX idx_partners_city ON public.partners(city);
CREATE INDEX idx_partners_type ON public.partners(partner_type);
CREATE INDEX idx_partners_active ON public.partners(is_active);
CREATE TRIGGER trg_partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- partners_public view
CREATE VIEW public.partners_public WITH (security_invoker = true) AS
SELECT id, name, partner_type, city, state, specialisations, is_active
FROM public.partners
WHERE is_active = true;
GRANT SELECT ON public.partners_public TO anon, authenticated;
-- Allow the view's underlying SELECT to bypass partners RLS via a permissive policy targeted at the view query
CREATE POLICY partners_public_select ON public.partners FOR SELECT TO anon, authenticated USING (is_active = true);

-- ============ TABLE 2: ai_conversations ============
CREATE TABLE public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled conversation',
  archetype_detected text,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  message_count int NOT NULL DEFAULT 0,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_conv_own_all ON public.ai_conversations FOR ALL TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
CREATE POLICY ai_conv_admin_select ON public.ai_conversations FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE INDEX idx_ai_conv_profile_last ON public.ai_conversations(profile_id, last_message_at DESC);
CREATE TRIGGER trg_ai_conv_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TABLE 3: ai_messages ============
CREATE TABLE public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role public.ai_message_role NOT NULL,
  content text NOT NULL,
  token_count int,
  model_used public.ai_model_used,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_msg_own_all ON public.ai_messages FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ai_conversations c WHERE c.id = conversation_id AND c.profile_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.ai_conversations c WHERE c.id = conversation_id AND c.profile_id = auth.uid()));
CREATE POLICY ai_msg_admin_select ON public.ai_messages FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE INDEX idx_ai_msg_conv_created ON public.ai_messages(conversation_id, created_at);
CREATE TRIGGER trg_ai_msg_updated_at BEFORE UPDATE ON public.ai_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TABLE 4: ai_usage_daily ============
CREATE TABLE public.ai_usage_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  usage_date date NOT NULL,
  messages_count int NOT NULL DEFAULT 0,
  tokens_used int NOT NULL DEFAULT 0,
  tier public.ai_tier NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, usage_date)
);
ALTER TABLE public.ai_usage_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_usage_select_own ON public.ai_usage_daily FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY ai_usage_admin_all ON public.ai_usage_daily FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_ai_usage_updated_at BEFORE UPDATE ON public.ai_usage_daily FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.calculate_ai_usage_today(p_profile_id uuid)
RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT messages_count FROM public.ai_usage_daily WHERE profile_id = p_profile_id AND usage_date = CURRENT_DATE), 0);
$$;

-- ============ TABLE 5: service_orders ============
CREATE SEQUENCE public.service_order_human_seq;

CREATE TABLE public.service_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_type public.service_type NOT NULL,
  amount_inr_paise bigint NOT NULL,
  status public.service_order_status NOT NULL DEFAULT 'created',
  razorpay_order_id text,
  razorpay_payment_id text,
  partner_ca_id uuid REFERENCES public.partners(id),
  customer_documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  order_id_human text UNIQUE,
  intake_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_orders_select_own ON public.service_orders FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY service_orders_admin_all ON public.service_orders FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX idx_service_orders_profile_status ON public.service_orders(profile_id, status);
CREATE INDEX idx_service_orders_razorpay ON public.service_orders(razorpay_order_id);
CREATE INDEX idx_service_orders_partner ON public.service_orders(partner_ca_id);
CREATE TRIGGER trg_service_orders_updated_at BEFORE UPDATE ON public.service_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.generate_service_order_human_id()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.order_id_human IS NULL THEN
    NEW.order_id_human := 'SOM-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.service_order_human_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_service_orders_human_id BEFORE INSERT ON public.service_orders FOR EACH ROW EXECUTE FUNCTION public.generate_service_order_human_id();

-- ============ TABLE 6: cohorts ============
CREATE TABLE public.cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  product_type public.cohort_product_type NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  application_deadline date NOT NULL,
  max_seats int NOT NULL DEFAULT 20,
  price_inr_paise bigint NOT NULL,
  is_open boolean NOT NULL DEFAULT true,
  captain_led boolean NOT NULL DEFAULT true,
  instructor_partner_id uuid REFERENCES public.partners(id),
  description text,
  curriculum_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
CREATE POLICY cohorts_select_open ON public.cohorts FOR SELECT TO anon, authenticated USING (is_open = true);
CREATE POLICY cohorts_admin_all ON public.cohorts FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX idx_cohorts_open_deadline ON public.cohorts(is_open, application_deadline);
CREATE TRIGGER trg_cohorts_updated_at BEFORE UPDATE ON public.cohorts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TABLE 7: cohort_applications ============
CREATE TABLE public.cohort_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cohort_id uuid NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  application_data jsonb NOT NULL,
  screening_status public.cohort_screening_status NOT NULL DEFAULT 'pending',
  ai_pre_screen_score int,
  ai_pre_screen_notes text,
  captain_notes text,
  payment_link text,
  payment_status public.cohort_payment_status NOT NULL DEFAULT 'not_sent',
  enrolled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cohort_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY cohort_apps_select_own ON public.cohort_applications FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY cohort_apps_insert_own ON public.cohort_applications FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());
CREATE POLICY cohort_apps_admin_all ON public.cohort_applications FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX idx_cohort_apps_cohort_status ON public.cohort_applications(cohort_id, screening_status);
CREATE INDEX idx_cohort_apps_profile ON public.cohort_applications(profile_id);
CREATE TRIGGER trg_cohort_apps_updated_at BEFORE UPDATE ON public.cohort_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TABLE 8: subscriptions ============
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product public.subscription_product NOT NULL,
  amount_inr_paise bigint NOT NULL,
  billing_cycle public.subscription_billing_cycle NOT NULL,
  status public.subscription_status NOT NULL DEFAULT 'active',
  razorpay_subscription_id text,
  next_billing_date date,
  started_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subs_select_own ON public.subscriptions FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY subs_admin_all ON public.subscriptions FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX idx_subs_profile_status ON public.subscriptions(profile_id, status);
CREATE INDEX idx_subs_status_next ON public.subscriptions(status, next_billing_date);
CREATE TRIGGER trg_subs_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

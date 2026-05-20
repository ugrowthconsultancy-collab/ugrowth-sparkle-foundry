
CREATE TYPE public.language_code AS ENUM ('en', 'hi');
CREATE TYPE public.user_current_role AS ENUM ('salaried', 'side_hustling', 'returning_homemaker', 'first_gen_consultant', 'tier2_dreamer', 'fully_independent');
CREATE TYPE public.revenue_range AS ENUM ('0', '0-25k', '25k-1L', '1L-5L', '5L-25L', '25L+');
CREATE TYPE public.content_type AS ENUM ('article', 'framework_pdf', 'template', 'checklist', 'video', 'podcast');
CREATE TYPE public.business_stage AS ENUM ('plan_start', 'manage_grow', 'scale_exit', 'all');
CREATE TYPE public.tool_name AS ENUM ('niche_generator', 'rate_card_builder', 'gst_checker', 'compliance_calendar', 'working_capital_calc', 'founder_vital_signs', 'pricing_calculator', 'should_i_switch');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- profiles (created before is_admin function references it)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  preferred_name text,
  phone_e164 text CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+91[0-9]{10}$'),
  city text,
  state text,
  pincode text CHECK (pincode IS NULL OR pincode ~ '^[0-9]{6}$'),
  language_preference public.language_code NOT NULL DEFAULT 'en',
  "current_role" public.user_current_role,
  business_name text,
  business_age_months int,
  industry text,
  monthly_revenue_range public.revenue_range,
  avatar_url text,
  bio text,
  linkedin_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  consent_marketing boolean NOT NULL DEFAULT false,
  consent_dpdp boolean NOT NULL DEFAULT false,
  grievance_officer_acknowledged boolean NOT NULL DEFAULT false,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_profiles_city ON public.profiles (city);
CREATE INDEX idx_profiles_current_role ON public.profiles ("current_role");
CREATE INDEX idx_profiles_language_preference ON public.profiles (language_preference);
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = _user_id), false);
$$;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- archetypes
CREATE TABLE public.archetypes (
  code text PRIMARY KEY,
  label_en text NOT NULL,
  label_hi text NOT NULL,
  description_en text NOT NULL,
  description_hi text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.archetypes ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_archetypes_updated_at BEFORE UPDATE ON public.archetypes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "archetypes_select_authenticated" ON public.archetypes FOR SELECT TO authenticated USING (true);
CREATE POLICY "archetypes_admin_all" ON public.archetypes FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.archetypes (code, label_en, label_hi, description_en, description_hi, sort_order) VALUES
  ('stuck_professional', 'Stuck Professional', 'अटका हुआ पेशेवर', 'Salaried professional feeling capped and ready to start their own practice.', 'वेतनभोगी पेशेवर जो सीमित महसूस कर रहा है और अपना अभ्यास शुरू करने को तैयार है।', 1),
  ('side_hustler', 'Side Hustler', 'साइड हसलर', 'Already earning on the side and looking to formalise into a real practice.', 'पहले से साइड में कमा रहा है और इसे एक वास्तविक अभ्यास में बदलना चाहता है।', 2),
  ('returning_homemaker', 'Returning Homemaker', 'वापस लौटती गृहिणी', 'Returning to professional work and wants a flexible, independent practice.', 'पेशेवर काम में लौट रही है और लचीला, स्वतंत्र अभ्यास चाहती है।', 3),
  ('rising_graduate', 'Rising Graduate', 'उभरता हुआ स्नातक', 'New graduate skipping the corporate path to build an independent practice.', 'नया स्नातक जो कॉर्पोरेट रास्ते के बजाय स्वतंत्र अभ्यास बनाना चाहता है।', 4),
  ('first_gen_consultant', 'First-Gen Consultant', 'पहली पीढ़ी का सलाहकार', 'First in family to go independent. Needs methodology, tools and confidence.', 'परिवार में पहला व्यक्ति जो स्वतंत्र हो रहा है। तरीका, उपकरण और आत्मविश्वास चाहिए।', 5),
  ('tier2_dreamer', 'Tier-2 Dreamer', 'टियर-2 सपने देखने वाला', 'Building a serious practice from a Tier-2/3 city without metro-level networks.', 'मेट्रो-स्तर के नेटवर्क के बिना टियर-2/3 शहर से गंभीर अभ्यास बना रहा है।', 6);

-- content_resources
CREATE TABLE public.content_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content_type public.content_type NOT NULL,
  body_markdown text,
  pdf_url text,
  thumbnail_url text,
  topic_tags text[] NOT NULL DEFAULT '{}',
  audience_tags text[] NOT NULL DEFAULT '{}',
  business_stage public.business_stage NOT NULL DEFAULT 'all',
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  language public.language_code NOT NULL DEFAULT 'en',
  seo_title text,
  seo_description text,
  download_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.content_resources ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_content_published_featured ON public.content_resources (is_published, is_featured);
CREATE INDEX idx_content_language ON public.content_resources (language);
CREATE TRIGGER trg_content_resources_updated_at BEFORE UPDATE ON public.content_resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "content_select_published" ON public.content_resources FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "content_admin_all" ON public.content_resources FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- testimonials
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_designation text,
  customer_city text,
  customer_photo_url text,
  testimonial_text text NOT NULL,
  product_used text,
  star_rating int CHECK (star_rating BETWEEN 1 AND 5),
  is_featured boolean NOT NULL DEFAULT false,
  permission_to_publish boolean NOT NULL DEFAULT false,
  language public.language_code NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "testimonials_select_public" ON public.testimonials FOR SELECT TO anon, authenticated USING (is_featured = true AND permission_to_publish = true);
CREATE POLICY "testimonials_admin_all" ON public.testimonials FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- waitlists
CREATE TABLE public.waitlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  email text NOT NULL,
  name text,
  product_interested_in text NOT NULL,
  notes text,
  priority int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.waitlists ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_waitlists_product ON public.waitlists (product_interested_in);
CREATE TRIGGER trg_waitlists_updated_at BEFORE UPDATE ON public.waitlists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "waitlists_insert_anyone" ON public.waitlists FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "waitlists_admin_all" ON public.waitlists FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- campaign_tracking
CREATE TABLE public.campaign_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  referrer_url text,
  landing_page text NOT NULL,
  session_id text NOT NULL,
  event_name text NOT NULL,
  event_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.campaign_tracking ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_campaign_profile ON public.campaign_tracking (profile_id);
CREATE INDEX idx_campaign_event ON public.campaign_tracking (event_name);
CREATE INDEX idx_campaign_created_desc ON public.campaign_tracking (created_at DESC);
CREATE TRIGGER trg_campaign_tracking_updated_at BEFORE UPDATE ON public.campaign_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "campaign_insert_anyone" ON public.campaign_tracking FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "campaign_admin_all" ON public.campaign_tracking FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- admin_logs
CREATE TABLE public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  notes text,
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_admin_logs_updated_at BEFORE UPDATE ON public.admin_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "admin_logs_select_admin" ON public.admin_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- tools_outputs
CREATE TABLE public.tools_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  email text,
  tool_name public.tool_name NOT NULL,
  input_data jsonb NOT NULL,
  output_data jsonb NOT NULL,
  shared_to_email text,
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tools_outputs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_tools_profile ON public.tools_outputs (profile_id);
CREATE INDEX idx_tools_name ON public.tools_outputs (tool_name);
CREATE INDEX idx_tools_created_desc ON public.tools_outputs (created_at DESC);
CREATE TRIGGER trg_tools_outputs_updated_at BEFORE UPDATE ON public.tools_outputs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "tools_insert_anyone" ON public.tools_outputs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "tools_select_own" ON public.tools_outputs FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY "tools_admin_all" ON public.tools_outputs FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('testimonial_photos', 'testimonial_photos', true),
  ('content_resources', 'content_resources', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'avatars');
CREATE POLICY "avatars_owner_write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_owner_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_owner_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "testimonial_photos_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'testimonial_photos');
CREATE POLICY "testimonial_photos_admin_write" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'testimonial_photos' AND public.is_admin(auth.uid())) WITH CHECK (bucket_id = 'testimonial_photos' AND public.is_admin(auth.uid()));

CREATE POLICY "content_resources_auth_read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'content_resources');
CREATE POLICY "content_resources_admin_write" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'content_resources' AND public.is_admin(auth.uid())) WITH CHECK (bucket_id = 'content_resources' AND public.is_admin(auth.uid()));

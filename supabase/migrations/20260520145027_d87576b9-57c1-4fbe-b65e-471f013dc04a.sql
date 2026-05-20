
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY app_settings_admin_select ON public.app_settings
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY app_settings_admin_insert ON public.app_settings
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY app_settings_admin_update ON public.app_settings
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.get_public_setting(p_key text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT value FROM public.app_settings
  WHERE key = p_key
    AND p_key IN ('upi_id', 'whatsapp_number', 'captain_name')
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_setting(text) TO anon, authenticated;

INSERT INTO public.app_settings (key, value) VALUES
  ('upi_id', '9650297779@upi'),
  ('whatsapp_number', '+919650297779'),
  ('captain_name', 'Captain Ankur Kulshrestha (Retd)')
ON CONFLICT (key) DO NOTHING;

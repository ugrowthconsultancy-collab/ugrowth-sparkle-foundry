
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins read app_settings" ON public.app_settings;
CREATE POLICY "admins read app_settings" ON public.app_settings
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admins write app_settings" ON public.app_settings;
CREATE POLICY "admins write app_settings" ON public.app_settings
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS trg_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER trg_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_public_setting(p_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v TEXT;
BEGIN
  IF p_key NOT IN (
    'upi_id',
    'upi_payee_name',
    'whatsapp_number',
    'whatsapp_default_message_en',
    'whatsapp_default_message_hi'
  ) THEN
    RETURN NULL;
  END IF;
  SELECT value INTO v FROM public.app_settings WHERE key = p_key;
  RETURN v;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_setting(TEXT) TO anon, authenticated;

INSERT INTO public.app_settings (key, value, description) VALUES
  ('upi_id', 'ugrowth@upi', 'Receiving UPI VPA shown on the order checkout page'),
  ('upi_payee_name', 'UGrowth Consultancy', 'Name shown alongside the UPI QR'),
  ('whatsapp_number', '+919999999999', 'WhatsApp business number in E.164 format (e.g. +919999999999)'),
  ('whatsapp_default_message_en', 'Hi UGrowth team, I would like to know more about your services.', 'Default WhatsApp message (English)'),
  ('whatsapp_default_message_hi', 'नमस्ते UGrowth team, मुझे आपकी सेवाओं के बारे में और जानना है।', 'Default WhatsApp message (Hindi)')
ON CONFLICT (key) DO UPDATE SET description = EXCLUDED.description WHERE public.app_settings.description IS NULL;

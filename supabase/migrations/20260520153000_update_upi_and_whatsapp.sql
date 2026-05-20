-- Update UPI receiving details to Surendra Kulshrestha (surendra01-3@okicici)
-- and ensure WhatsApp business number matches the real number used across the app.
-- This OVERWRITES any prior values; admin can still change them later via /admin/settings.

INSERT INTO public.app_settings (key, value, description) VALUES
  ('upi_id',         'surendra01-3@okicici',  'Receiving UPI VPA shown on the order checkout page'),
  ('upi_payee_name', 'Surendra Kulshrestha',  'Name shown alongside the UPI QR'),
  ('whatsapp_number','+919650297779',         'WhatsApp business number in E.164 format')
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      description = COALESCE(public.app_settings.description, EXCLUDED.description);

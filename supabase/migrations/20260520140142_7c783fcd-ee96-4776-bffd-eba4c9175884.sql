
ALTER TABLE public.ai_conversations ALTER COLUMN profile_id DROP NOT NULL;
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS anon_id TEXT;
CREATE INDEX IF NOT EXISTS idx_ai_conv_anon ON public.ai_conversations(anon_id) WHERE anon_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_conv_profile_last ON public.ai_conversations(profile_id, last_message_at DESC) WHERE profile_id IS NOT NULL AND is_archived = false;

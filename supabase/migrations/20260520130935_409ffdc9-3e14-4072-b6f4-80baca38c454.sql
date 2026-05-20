
REVOKE ALL ON FUNCTION public.calculate_ai_usage_today(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_ai_usage_today(uuid) TO service_role;

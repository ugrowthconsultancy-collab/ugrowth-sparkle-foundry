
-- Ensure the sequence used by generate_service_order_human_id exists
CREATE SEQUENCE IF NOT EXISTS public.service_order_human_seq START 1;

-- Attach existing function as BEFORE INSERT trigger
DROP TRIGGER IF EXISTS trg_service_orders_human_id ON public.service_orders;
CREATE TRIGGER trg_service_orders_human_id
BEFORE INSERT ON public.service_orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_service_order_human_id();

-- Auto-assign a partner CA in the user's city
CREATE OR REPLACE FUNCTION public.assign_partner_ca_for_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_city text;
  matched_partner uuid;
BEGIN
  IF NEW.partner_ca_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT city INTO user_city FROM public.profiles WHERE id = NEW.profile_id;
  IF user_city IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT id INTO matched_partner
  FROM public.partners
  WHERE partner_type = 'ca'
    AND is_active = true
    AND lower(city) = lower(user_city)
  ORDER BY created_at ASC
  LIMIT 1;

  IF matched_partner IS NOT NULL THEN
    NEW.partner_ca_id := matched_partner;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_service_orders_assign_ca ON public.service_orders;
CREATE TRIGGER trg_service_orders_assign_ca
BEFORE INSERT ON public.service_orders
FOR EACH ROW
EXECUTE FUNCTION public.assign_partner_ca_for_order();

-- updated_at maintenance triggers (idempotent)
DROP TRIGGER IF EXISTS trg_service_orders_updated_at ON public.service_orders;
CREATE TRIGGER trg_service_orders_updated_at
BEFORE UPDATE ON public.service_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

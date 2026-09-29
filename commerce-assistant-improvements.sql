-- Seller fulfillment facts and privacy-safe conversation demand insights.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS seller_responded_at timestamptz;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS availability_confirmed_at timestamptz;
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS service_area text,
    ADD COLUMN IF NOT EXISTS payment_methods text[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.assistant_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_type text NOT NULL CHECK (event_type IN ('inquiry', 'unanswered', 'no_result_search')),
    query_text text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS assistant_events_business_created_idx
    ON public.assistant_events (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS assistant_events_business_type_idx
    ON public.assistant_events (business_id, event_type, created_at DESC);

ALTER TABLE public.assistant_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Businesses can view their assistant insights" ON public.assistant_events;
CREATE POLICY "Businesses can view their assistant insights" ON public.assistant_events
    FOR SELECT TO authenticated USING ((select auth.uid()) = business_id);
REVOKE ALL ON public.assistant_events FROM anon, authenticated;
GRANT SELECT ON public.assistant_events TO authenticated;
GRANT ALL ON public.assistant_events TO service_role;

-- Keep catalog timestamps meaningful whenever owners change stock or item details.
CREATE OR REPLACE FUNCTION public.touch_product_catalog_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS products_touch_catalog_updated_at ON public.products;
CREATE TRIGGER products_touch_catalog_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.touch_product_catalog_updated_at();

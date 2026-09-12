-- Free plans allow five active catalog items. Inactive items do not count.
CREATE OR REPLACE FUNCTION get_product_count(uid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM public.products WHERE user_id = uid AND is_active = TRUE);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION can_add_product(uid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_plan TEXT;
    product_count INTEGER;
BEGIN
    SELECT plan INTO user_plan FROM public.users WHERE id = uid;
    IF user_plan = 'pro' THEN RETURN TRUE; END IF;
    SELECT COUNT(*) INTO product_count FROM public.products WHERE user_id = uid AND is_active = TRUE;
    RETURN product_count < 5;
END;
$$ LANGUAGE plpgsql;

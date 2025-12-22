-- =============================================
-- UPDATE CATEGORIES
-- Run this in Supabase SQL Editor
-- =============================================

INSERT INTO public.categories (name, slug, icon) VALUES
    ('Perfumes & Fragrances', 'perfumes-fragrances', '🧴'),
    ('Logistics & Delivery', 'logistics-delivery', '🚚'),
    ('Groceries & Provisions', 'groceries-provisions', '🛒'),
    ('Agriculture & Farming', 'agriculture-farming', '🌱'),
    ('Cleaning & Laundry', 'cleaning-laundry', '🧺')
ON CONFLICT (slug) DO NOTHING;

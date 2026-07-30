-- =============================================
-- NaijaBiz.org - Schema Update V2
-- AI Sales Assistant Evolution & Stock/Service Support
-- Run this in Supabase SQL Editor
-- =============================================

-- Add in_stock and item_type columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'product' CHECK (item_type IN ('product', 'service'));

-- Add persona and business_type columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS ai_persona TEXT DEFAULT 'friendly' CHECK (ai_persona IN ('friendly', 'formal', 'pidgin')),
ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'products' CHECK (business_type IN ('products', 'services', 'both'));

-- Index for stock and item_type queries
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_item_type ON public.products(item_type);

-- Update RLS policies to allow reading products in_stock & item_type
-- (Covered by existing "Products are viewable by everyone" policy)

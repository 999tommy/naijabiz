-- =============================================
-- NaijaBiz.org - Complete Database Schema
-- Copy and paste this entire file into Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed categories
INSERT INTO public.categories (name, slug, icon) VALUES
    ('Fashion', 'fashion', '👗'),
    ('Electronics', 'electronics', '📱'),
    ('Food & Drinks', 'food-drinks', '🍔'),
    ('Beauty & Cosmetics', 'beauty-cosmetics', '💄'),
    ('Home & Furniture', 'home-furniture', '🏠'),
    ('Health & Wellness', 'health-wellness', '💊'),
    ('Phones & Accessories', 'phones-accessories', '📞'),
    ('Wigs & Hair', 'wigs-hair', '💇'),
    ('Shoes & Bags', 'shoes-bags', '👟'),
    ('Jewelry & Watches', 'jewelry-watches', '💍'),
    ('Baby & Kids', 'baby-kids', '👶'),
    ('Books & Stationery', 'books-stationery', '📚'),
    ('Sports & Fitness', 'sports-fitness', '⚽'),
    ('Art & Crafts', 'art-crafts', '🎨'),
    ('Automotive', 'automotive', '🚗'),
    ('Services', 'services', '🔧'),
    ('Others', 'others', '📦')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- USERS TABLE (Extended profile)
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    phone TEXT,
    business_name TEXT,
    business_slug TEXT UNIQUE,
    description TEXT,
    location TEXT,
    category_id UUID REFERENCES public.categories(id),
    whatsapp_number TEXT,
    instagram_handle TEXT,
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_document_url TEXT,
    verification_status TEXT DEFAULT 'none' CHECK (verification_status IN ('none', 'pending', 'approved', 'rejected')),
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
    subscription_id TEXT,
    subscription_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_users_business_slug ON public.users(business_slug);
CREATE INDEX IF NOT EXISTS idx_users_category ON public.users(category_id);
CREATE INDEX IF NOT EXISTS idx_users_location ON public.users(location);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON public.users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_contact TEXT NOT NULL,
    items JSONB NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    order_method TEXT DEFAULT 'whatsapp' CHECK (order_method IN ('whatsapp', 'instagram')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_contact TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON public.reviews(business_id);

-- =============================================
-- PAGE VIEWS TABLE (Analytics)
-- =============================================
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    viewer_ip TEXT,
    viewer_user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_views_business_id ON public.page_views(business_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories: Everyone can read
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

-- Users: Everyone can read, owners can update their own
CREATE POLICY "Users are viewable by everyone" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Products: Everyone can read, owners can manage their own
CREATE POLICY "Products are viewable by everyone" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own products" ON public.products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" ON public.products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" ON public.products
    FOR DELETE USING (auth.uid() = user_id);

-- Orders: Owners can view their own orders
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create orders" ON public.orders
    FOR INSERT WITH CHECK (true);

-- Reviews: Everyone can read, anyone can insert
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (true);

-- Page views: Business owners can view their own analytics
CREATE POLICY "Users can view their own page views" ON public.page_views
    FOR SELECT USING (auth.uid() = business_id);

CREATE POLICY "Anyone can create page views" ON public.page_views
    FOR INSERT WITH CHECK (true);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to generate unique slug from business name
CREATE OR REPLACE FUNCTION generate_unique_slug(business_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    new_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert to lowercase, replace spaces with hyphens, remove special chars
    base_slug := lower(regexp_replace(business_name, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    new_slug := base_slug;
    
    -- Check for existing slug and add counter if needed
    WHILE EXISTS (SELECT 1 FROM public.users WHERE business_slug = new_slug) LOOP
        counter := counter + 1;
        new_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to count products for a user (for enforcing free tier limits)
CREATE OR REPLACE FUNCTION get_product_count(uid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM public.products WHERE user_id = uid);
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can add more products
CREATE OR REPLACE FUNCTION can_add_product(uid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_plan TEXT;
    product_count INTEGER;
BEGIN
    SELECT plan INTO user_plan FROM public.users WHERE id = uid;
    
    IF user_plan = 'pro' THEN
        RETURN TRUE;
    END IF;
    
    SELECT COUNT(*) INTO product_count FROM public.products WHERE user_id = uid;
    
    RETURN product_count < 3;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STORAGE BUCKET
-- =============================================
-- Note: Run this in Supabase Dashboard > Storage > Create new bucket
-- Bucket name: business-images
-- Public bucket: Yes (for product images to be publicly accessible)

-- Storage policies (run after creating the bucket)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('business-images', 'business-images', true);

-- =============================================
-- SETUP COMPLETE!
-- =============================================
-- After running this migration:
-- 1. Go to Storage > Create bucket named "business-images" (make it public)
-- 2. Add storage policies for the bucket in Storage > Policies

-- ==============================================================================
-- Qriblo Marketplace Vector Store & Semantic Search Schema
-- Enables pgvector and creates discovered_products table for RAG caching
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the discovered_products table
CREATE TABLE IF NOT EXISTS public.discovered_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    price TEXT,
    currency TEXT DEFAULT 'NGN',
    url TEXT NOT NULL UNIQUE,
    source TEXT NOT NULL, -- e.g. 'bumpa', 'selar', 'paystack', 'shein', 'temu', 'local_store'
    vendor_name TEXT,
    description TEXT,
    embedding VECTOR(1536), -- 1536 dimensions for text-embedding-3-small
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create HNSW index for high-speed approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS idx_discovered_products_embedding 
ON public.discovered_products 
USING hnsw (embedding vector_cosine_ops);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.discovered_products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to discovered products
CREATE POLICY "Public read discovered products"
ON public.discovered_products
FOR SELECT
USING (true);

-- Allow service role full access
CREATE POLICY "Service role full access on discovered products"
ON public.discovered_products
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Semantic similarity search RPC function
CREATE OR REPLACE FUNCTION match_discovered_products (
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.65,
    match_count INT DEFAULT 6
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    price TEXT,
    url TEXT,
    source TEXT,
    vendor_name TEXT,
    description TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dp.id,
        dp.title,
        dp.price,
        dp.url,
        dp.source,
        dp.vendor_name,
        dp.description,
        1 - (dp.embedding <=> query_embedding) AS similarity
    FROM public.discovered_products dp
    WHERE dp.embedding IS NOT NULL
      AND 1 - (dp.embedding <=> query_embedding) > match_threshold
    ORDER BY dp.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

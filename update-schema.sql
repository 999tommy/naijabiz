-- =============================================
-- Update Schema: TikTok Handle, Upvotes, and Verification
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add TikTok Handle to Users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS tiktok_handle TEXT;

-- 2. Add Upvotes to Users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0;

-- 3. Index for Leaderboard Performance
CREATE INDEX IF NOT EXISTS idx_users_upvotes ON public.users(upvotes DESC);

-- 4. Function to atomic increment upvotes
CREATE OR REPLACE FUNCTION increment_upvotes(row_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET upvotes = upvotes + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Ensure Verification Status is correct for existing users (optional cleanup)
-- Update specific users if needed, or leave as is.

-- 6. Add policy for upvoting (Anyone can call the function via RPC if we expose it, 
-- or we handle it via a public API route with service role key if we want to restrict rate limiting there)
-- For simplicity, if we use Supabase client directly to call the function:
GRANT EXECUTE ON FUNCTION increment_upvotes TO anon, authenticated, service_role;

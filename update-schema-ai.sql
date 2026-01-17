-- Add AI Assistant columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_instructions TEXT,
ADD COLUMN IF NOT EXISTS ai_welcome_msg TEXT DEFAULT 'Hello! How can I help you today?',
ADD COLUMN IF NOT EXISTS ai_usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_usage_limit INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS ai_last_reset_at TIMESTAMPTZ DEFAULT NOW();

-- Policy: Allow public to read ai_enabled and welcome_msg (for the widget)
-- (Existing "Users are viewable by everyone" policy covers this)

-- Function to increment usage safely
CREATE OR REPLACE FUNCTION increment_ai_usage(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_usage INTEGER;
    limit_val INTEGER;
    is_pro BOOLEAN;
BEGIN
    -- Check if Pro
    SELECT (plan = 'pro'), ai_usage_count, ai_usage_limit 
    INTO is_pro, current_usage, limit_val 
    FROM public.users 
    WHERE id = user_id;

    IF NOT is_pro THEN
        RETURN FALSE;
    END IF;

    IF current_usage >= limit_val THEN
        RETURN FALSE;
    END IF;

    UPDATE public.users 
    SET ai_usage_count = ai_usage_count + 1 
    WHERE id = user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

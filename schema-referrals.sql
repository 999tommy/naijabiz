-- Add referral columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by);

-- Function to handle referral logic
CREATE OR REPLACE FUNCTION handle_new_referral()
RETURNS TRIGGER AS $$
DECLARE
    referrer_current_plan TEXT;
    referrer_current_count INTEGER;
BEGIN
    -- Only proceed if there is a referrer
    IF NEW.referred_by IS NOT NULL THEN
        -- Get referrer's current status
        SELECT plan, referral_count INTO referrer_current_plan, referrer_current_count
        FROM public.users
        WHERE id = NEW.referred_by;

        -- Increment count
        UPDATE public.users
        SET referral_count = referral_count + 1
        WHERE id = NEW.referred_by;

        -- Check if they reached the threshold (4 -> 5)
        -- We check if existing count was 4, so now it is 5.
        IF referrer_current_count = 4 THEN
            -- Grant 1 month Pro
            -- Only if they are currently FREE (as per requirement "free users see that they should upgrade")
            -- If they are already Pro, we might not want to interfere with paid subs, or we could extend.
            -- For simplicity and safety, we only upgrade 'free' users to 'pro' with an expiry.
            
            IF referrer_current_plan = 'free' THEN
                UPDATE public.users
                SET plan = 'pro',
                    subscription_ends_at = NOW() + INTERVAL '1 month',
                    referral_count = 0 -- Reset count as requested ("option... disappears" implies done)
                WHERE id = NEW.referred_by;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run after a new user is created
DROP TRIGGER IF EXISTS on_user_created_referral ON public.users;
CREATE TRIGGER on_user_created_referral
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_referral();

-- =============================================
-- Referral Program Updates
-- =============================================

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS referral_payment_details JSONB,
ADD COLUMN IF NOT EXISTS has_joined_referral BOOLEAN DEFAULT FALSE;

-- Create referral_payouts table to track payouts
CREATE TABLE IF NOT EXISTS public.referral_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    paid_by TEXT NOT NULL,
    status TEXT DEFAULT 'paid' CHECK (status IN ('pending', 'paid')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_payouts_user_id ON public.referral_payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_payouts_created_at ON public.referral_payouts(created_at DESC);

-- Allow RLS on the new table
ALTER TABLE public.referral_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all payouts" ON public.referral_payouts
    FOR SELECT USING (auth.jwt() ->> 'email' = 'tommmy@gmail.com');

CREATE POLICY "Users can view their own payouts" ON public.referral_payouts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert payouts" ON public.referral_payouts
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'tommmy@gmail.com');

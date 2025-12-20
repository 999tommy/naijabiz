ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS paystack_customer_code TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS paystack_plan_code TEXT;

CREATE TABLE IF NOT EXISTS public.paystack_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL,
    event TEXT,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    customer_email TEXT,
    plan_code TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_paystack_transactions_user_id ON public.paystack_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_paystack_transactions_created_at ON public.paystack_transactions(created_at DESC);

-- 3) RLS
ALTER TABLE public.paystack_transactions ENABLE ROW LEVEL SECURITY;

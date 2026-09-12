-- Qriblo booking calendar and availability
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS booking_hours JSONB DEFAULT '{"monday":{"enabled":true,"start":"09:00","end":"17:00"},"tuesday":{"enabled":true,"start":"09:00","end":"17:00"},"wednesday":{"enabled":true,"start":"09:00","end":"17:00"},"thursday":{"enabled":true,"start":"09:00","end":"17:00"},"friday":{"enabled":true,"start":"09:00","end":"17:00"},"saturday":{"enabled":true,"start":"10:00","end":"15:00"},"sunday":{"enabled":false,"start":"09:00","end":"17:00"}}'::jsonb,
    ADD COLUMN IF NOT EXISTS booking_slot_minutes INTEGER DEFAULT 60;

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'rescheduled', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_business_date ON public.bookings(business_id, booking_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_active_slot ON public.bookings(business_id, booking_date, booking_time)
    WHERE status IN ('confirmed', 'rescheduled');

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Businesses can view their own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = business_id);
CREATE POLICY "Anyone can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Businesses can update their own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = business_id);

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

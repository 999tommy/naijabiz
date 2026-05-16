-- Migration for Her Excellence Waitlist
CREATE TABLE IF NOT EXISTS her_excellence_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT NOT NULL,
    birthday TEXT,
    location TEXT NOT NULL,
    personal_style TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE her_excellence_waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy for inserts
CREATE POLICY "Allow public inserts on her_excellence_waitlist"
ON her_excellence_waitlist
FOR INSERT
TO public
WITH CHECK (true);

-- Create policy for reading (only for admin/dashboard)
-- Adjust based on your auth setup, but here we allow public read for the demo dashboard, 
-- or you could just restrict it and let the server action read it with service role.
-- If the dashboard is fake login and uses a server action to fetch, we can use a server client.
CREATE POLICY "Allow anon read for now"
ON her_excellence_waitlist
FOR SELECT
TO public
USING (true);

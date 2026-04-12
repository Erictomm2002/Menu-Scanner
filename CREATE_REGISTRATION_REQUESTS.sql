-- Create registration_requests table for tracking user registration requests
CREATE TABLE IF NOT EXISTS registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  team_sale TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES allowed_users(id)
);

-- Enable Row Level Security
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create a registration request
CREATE POLICY "Anyone can insert registration requests"
  ON registration_requests FOR INSERT
  WITH CHECK (true);

-- Policy: Only service_role can read registration requests (for admin)
CREATE POLICY "Admin only can read registration requests"
  ON registration_requests FOR SELECT
  USING (auth.role() = 'service_role');

-- Policy: Only service_role can update (approve/reject)
CREATE POLICY "Admin only can update registration requests"
  ON registration_requests FOR UPDATE
  USING (auth.role() = 'service_role');

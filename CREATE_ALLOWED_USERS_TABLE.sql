-- Create allowed_users table for whitelist-based authentication
CREATE TABLE IF NOT EXISTS allowed_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read allowed_users (to check whitelist)
-- This is needed for the callback route to verify email against whitelist
CREATE POLICY "Allow read for authenticated users" ON allowed_users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only service_role (admin) can insert new users
CREATE POLICY "Admin only insert" ON allowed_users
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Policy: Only service_role (admin) can update users
CREATE POLICY "Admin only update" ON allowed_users
  FOR UPDATE USING (auth.role() = 'service_role');

-- Policy: Only service_role (admin) can delete users
CREATE POLICY "Admin only delete" ON allowed_users
  FOR DELETE USING (auth.role() = 'service_role');

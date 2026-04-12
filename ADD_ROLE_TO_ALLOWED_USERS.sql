-- Add role column to allowed_users for RBAC
-- Default role is 'staff', owner email gets 'owner' role

ALTER TABLE allowed_users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'staff';

-- Update existing owner email to have 'owner' role
UPDATE allowed_users SET role = 'owner' WHERE email = 'kiva.faiz.ryuki@gmail.com';

-- Update other existing users to 'staff'
UPDATE allowed_users SET role = 'staff' WHERE role IS NULL OR role = '';

-- Optional: Add constraint to ensure only valid roles
ALTER TABLE allowed_users DROP CONSTRAINT IF EXISTS valid_role;
ALTER TABLE allowed_users ADD CONSTRAINT valid_role CHECK (role IN ('owner', 'staff'));

-- Add discounts column to quotations table
-- This column will store an array of discount objects with label and amount
ALTER TABLE quotations ADD COLUMN discounts JSONB DEFAULT '[]'::jsonb;

-- Create index on discounts for efficient querying (optional, for JSONB queries)
-- CREATE INDEX idx_quotations_discounts ON quotations USING GIN (discounts);

-- Update existing quotations to have empty discounts array
-- This ensures backward compatibility with existing data
UPDATE quotations SET discounts = '[]'::jsonb WHERE discounts IS NULL;

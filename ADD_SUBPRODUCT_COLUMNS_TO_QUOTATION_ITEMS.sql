-- Add subproduct-related columns to quotation_items table
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS subproduct_id UUID;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS is_subproduct BOOLEAN DEFAULT false;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS parent_item_id UUID;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS indent_level INTEGER DEFAULT 0;

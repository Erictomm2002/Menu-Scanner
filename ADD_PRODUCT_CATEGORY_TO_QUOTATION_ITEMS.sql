-- Add product_category column to quotation_items table
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS product_category VARCHAR(20);

COMMENT ON COLUMN quotation_items.product_category IS 'Product category (software/hardware) - copied from products table for categorization reliability';

-- Set default value for existing records based on keyword matching (backward compatibility)
UPDATE quotation_items
SET product_category = CASE
  WHEN (
    LOWER(name) LIKE '%phần mềm%' OR
    LOWER(name) LIKE '%software%' OR
    LOWER(name) LIKE '%app%' OR
    LOWER(name) LIKE '%gói%' OR
    LOWER(name) LIKE '%hóa đơn%' OR
    LOWER(name) LIKE '%server%' OR
    LOWER(name) LIKE '%bảo trì%' OR
    LOWER(name) LIKE '%cài%' OR
    LOWER(name) LIKE '%phiên bản%' OR
    COALESCE(LOWER(description), '') LIKE '%phần mềm%' OR
    COALESCE(LOWER(description), '') LIKE '%software%' OR
    COALESCE(LOWER(description), '') LIKE '%app%'
  ) THEN 'software'
  ELSE 'hardware'
END
WHERE product_category IS NULL;

-- Add check constraint to ensure only valid values
ALTER TABLE quotation_items
ADD CONSTRAINT chk_product_category
CHECK (product_category IN ('software', 'hardware', NULL));

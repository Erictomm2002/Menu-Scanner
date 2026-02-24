-- Create subproducts table
CREATE TABLE subproducts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(15,2) DEFAULT 0,  -- 0 = miễn phí
  unit VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_subproducts_product_id ON subproducts(product_id);

-- Enable Row Level Security (optional, depends on your auth setup)
ALTER TABLE subproducts ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subproducts_updated_at BEFORE UPDATE ON subproducts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comment for documentation
COMMENT ON TABLE subproducts IS 'Subproducts for products - additional items that belong to a main product';
COMMENT ON COLUMN subproducts.price IS 'Price of subproduct. 0 indicates free item (miễn phí)';
COMMENT ON COLUMN subproducts.sort_order IS 'Order for display in the product details';

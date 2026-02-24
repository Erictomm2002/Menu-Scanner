export enum ProductCategory {
  SOFTWARE = 'software',
  HARDWARE = 'hardware',
}

export enum QuotationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

// Subproduct interface
export interface Subproduct {
  id: string;
  product_id: string;
  name: string;
  price: number;
  unit?: string;
  created_at?: string;
  updated_at?: string;
}

// New subproduct data (without id and timestamps)
export interface NewSubproduct {
  product_id: string;
  name: string;
  price: number;
  unit?: string;
}

// Product with subproducts count
export interface ProductWithCount extends Product {
  subproducts_count?: number;
}

// Product with full subproducts data
export interface ProductWithSubproducts extends Product {
  subproducts: Subproduct[];
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description?: string;
  unit: string;
  price: number;
  // Image fields for Supabase Storage
  image_url?: string | null;
  image_path?: string | null;
  image_name?: string | null;
  image_size?: number | null;
  image_mime_type?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface QuotationDiscount {
  id: string;
  label: string;
  amount: number; // Negative for discounts
}

export interface QuotationItem {
  id?: string;
  quotation_id?: string;
  product_id?: string;
  name: string;
  description?: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_free?: boolean;
  row_number?: number;
  product_category?: ProductCategory;
  image_url?: string | null;
  image_mime_type?: string | null;
  is_subproduct?: boolean;
  parent_item_id?: string;
  subproduct_id?: string;
  indent_level?: number;
}

export interface Quotation {
  id?: string;
  quote_number: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_model?: string;
  notes?: string;
  subtotal_software: number;
  subtotal_hardware: number;
  discount_amount: number;
  total_amount: number;
  discounts?: QuotationDiscount[]; // Array of discounts for multiple discount lines
  status: QuotationStatus;
  created_at?: string;
  updated_at?: string;
}

export interface QuotationWithItems extends Quotation {
  items: QuotationItem[];
}

export interface QuotationSummary {
  item_count: number;
  software_items: number;
  hardware_items: number;
  subtotal: number;
  subtotalSoftware: number;
  subtotalHardware: number;
  discount: number;
  discounts?: QuotationDiscount[]; // Array of discounts for UI display
  total: number;
}

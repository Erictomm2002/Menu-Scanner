import { QuotationItem, QuotationSummary, QuotationDiscount, ProductCategory } from '@/types/quotation';

export function calculateItemTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice);
}

export function calculateQuotationSummary(
  items: QuotationItem[],
  discounts?: QuotationDiscount[]
): QuotationSummary {
  const softwareItems = items.filter((item) => categorizeItem(item) === ProductCategory.SOFTWARE);
  const hardwareItems = items.filter((item) => categorizeItem(item) === ProductCategory.HARDWARE);

  const subtotalSoftware = softwareItems.reduce(
    (sum, item) => sum + (item.is_free ? 0 : item.total_price),
    0
  );
  const subtotalHardware = hardwareItems.reduce(
    (sum, item) => sum + (item.is_free ? 0 : item.total_price),
    0
  );
  const subtotal = subtotalSoftware + subtotalHardware;

  // Calculate total discount from all discounts
  const discount = discounts
    ? discounts.reduce((sum, d) => sum + d.amount, 0)
    : 0;

  return {
    item_count: items.length,
    software_items: softwareItems.length,
    hardware_items: hardwareItems.length,
    subtotal,
    subtotalSoftware,
    subtotalHardware,
    discount: Math.abs(discount), // Store as positive for display
    discounts,
    total: subtotal + discount, // discount is negative, so this subtracts
  };
}

/**
 * Calculate the legacy discount_amount from discounts array for backward compatibility
 */
export function calculateLegacyDiscountAmount(discounts?: QuotationDiscount[]): number {
  if (!discounts || discounts.length === 0) {
    return 0;
  }
  // Sum all discount amounts (which are negative values) and return as positive
  return Math.abs(discounts.reduce((sum, d) => sum + d.amount, 0));
}

/**
 * Legacy categorization using keyword matching.
 * Used as fallback when product_category is not available.
 */
export function categorizeItemLegacy(item: QuotationItem): ProductCategory {
  const softwareKeywords = [
    'phần mềm',
    'software',
    'app',
    'gói',
    'hóa đơn',
    'server',
    'bảo trì',
  ];
  const lowerName = item.name.toLowerCase();
  const lowerDesc = (item.description || '').toLowerCase();

  const isSoftware =
    softwareKeywords.some((keyword) => lowerName.includes(keyword)) ||
    softwareKeywords.some((keyword) => lowerDesc.includes(keyword));

  return isSoftware ? ProductCategory.SOFTWARE : ProductCategory.HARDWARE;
}

/**
 * Categorize item using product_category field first, with fallback to keyword matching.
 * This ensures backward compatibility with items that don't have product_category set.
 */
export function categorizeItem(item: QuotationItem): ProductCategory {
  // First, try to use the product_category field from the item
  if (item.product_category) {
    return item.product_category;
  }
  // Fallback to legacy keyword matching for backward compatibility
  return categorizeItemLegacy(item);
}

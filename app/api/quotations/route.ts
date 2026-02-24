import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/libs/supabase-client';
import { QuotationStatus } from '@/types/quotation';
import { calculateQuotationSummary, calculateLegacyDiscountAmount } from '@/libs/quotation-calculator';

// GET /api/quotations - List quotations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let countQuery = supabase
      .from('quotations')
      .select('*', { count: 'exact', head: true });

    let dataQuery = supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && ['draft', 'sent', 'accepted', 'rejected'].includes(status)) {
      countQuery = countQuery.eq('status', status);
      dataQuery = dataQuery.eq('status', status);
    }

    if (search) {
      countQuery = countQuery.or(
        `customer_name.ilike.%${search}%,quote_number.ilike.%${search}%,customer_phone.ilike.%${search}%`
      );
      dataQuery = dataQuery.or(
        `customer_name.ilike.%${search}%,quote_number.ilike.%${search}%,customer_phone.ilike.%${search}%`
      );
    }

    const [{ count, error: countError }, { data, error }] = await Promise.all([
      countQuery,
      dataQuery,
    ]);

    if (error || countError) {
      return NextResponse.json({ error: error?.message || countError?.message }, { status: 400 });
    }

    return NextResponse.json({
      quotations: data || [],
      total: count || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/quotations - Create quotation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer_name, customer_phone, customer_address, customer_model, notes, discounts } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }

    // Validate items
    for (const item of items) {
      if (
        !item.name || item.name.trim() === '' ||
        !item.unit || item.unit.trim() === '' ||
        item.quantity === undefined || item.quantity === null ||
        item.unit_price === undefined || item.unit_price === null
      ) {
        return NextResponse.json(
          { error: 'Each item must have name, unit, quantity, and unit_price' },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    const summary = calculateQuotationSummary(items, discounts);

    // Generate quote number (format: BG + YYYYMMDD + 4 digit sequence)
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const quoteNumber = `BG${dateStr}${randomSuffix}`;

    // Create quotation
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .insert({
        quote_number: quoteNumber,
        customer_name,
        customer_phone,
        customer_address,
        customer_model,
        notes,
        subtotal_software: summary.subtotalSoftware,
        subtotal_hardware: summary.subtotalHardware,
        discount_amount: calculateLegacyDiscountAmount(discounts),
        total_amount: summary.total,
        discounts: discounts || [],
        status: QuotationStatus.DRAFT,
      })
      .select()
      .single();

    if (quotationError) {
      return NextResponse.json({ error: quotationError.message }, { status: 400 });
    }

    // Create quotation items
    const itemsToInsert = items.map((item: unknown, index: number) => {
      const typedItem = item as {
        product_id?: string;
        productId?: string;
        subproduct_id?: string;
        name: string;
        description?: string;
        unit: string;
        quantity: number | string;
        unit_price: number | string;
        total_price?: number | string;
        is_free?: boolean;
        is_subproduct?: boolean;
        parent_item_id?: string;
        indent_level?: number;
        product_category?: string;
      };
      return {
        quotation_id: quotation.id,
        product_id: typedItem.product_id || typedItem.productId || null,
        subproduct_id: typedItem.subproduct_id || null,
        name: typedItem.name,
        description: typedItem.description || null,
        unit: typedItem.unit,
        quantity: parseFloat(typedItem.quantity.toString()),
        unit_price: parseFloat(typedItem.unit_price.toString()),
        total_price: parseFloat(typedItem.total_price?.toString() || '0') || parseFloat(typedItem.quantity.toString()) * parseFloat(typedItem.unit_price.toString()),
        is_free: typedItem.is_free || false,
        is_subproduct: typedItem.is_subproduct || false,
        parent_item_id: typedItem.parent_item_id || null,
        indent_level: typedItem.indent_level || 0,
        row_number: index + 1,
        product_category: typedItem.product_category || null,
      };
    });

    const { error: itemsError } = await supabase
      .from('quotation_items')
      .insert(itemsToInsert);

    if (itemsError) {
      // Rollback quotation if items fail
      await supabase.from('quotations').delete().eq('id', quotation.id);
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }

    return NextResponse.json({ quotation, items: itemsToInsert }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

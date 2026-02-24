import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/libs/supabase-client';
import { QuotationStatus } from '@/types/quotation';
import { calculateQuotationSummary, calculateLegacyDiscountAmount } from '@/libs/quotation-calculator';

// GET /api/quotations/[id] - Get single quotation with items
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const [{ data: quotation, error: quotationError }, { data: items, error: itemsError }] =
      await Promise.all([
        supabase.from('quotations').select('*').eq('id', params.id).single(),
        supabase
          .from('quotation_items')
          .select('*')
          .eq('quotation_id', params.id)
          .order('row_number', { ascending: true }),
      ]);

    if (quotationError) {
      return NextResponse.json({ error: quotationError.message }, { status: 404 });
    }

    return NextResponse.json({
      quotation,
      items: items || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/quotations/[id] - Update quotation
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { items, customer_name, customer_phone, customer_address, customer_model, notes, status, discounts } = body;

    // Update quotation data
    const updateData: Record<string, unknown> = {};
    if (customer_name !== undefined) updateData.customer_name = customer_name;
    if (customer_phone !== undefined) updateData.customer_phone = customer_phone;
    if (customer_address !== undefined) updateData.customer_address = customer_address;
    if (customer_model !== undefined) updateData.customer_model = customer_model;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined && Object.values(QuotationStatus).includes(status)) {
      updateData.status = status;
    }

    // If items are provided, update them and recalculate totals
    if (items && Array.isArray(items)) {
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

      const summary = calculateQuotationSummary(items, discounts);
      updateData.subtotal_software = summary.subtotalSoftware;
      updateData.subtotal_hardware = summary.subtotalHardware;
      updateData.discount_amount = calculateLegacyDiscountAmount(discounts);
      updateData.total_amount = summary.total;
      updateData.discounts = discounts || [];

      // Delete existing items
      await supabase.from('quotation_items').delete().eq('quotation_id', params.id);

      // Insert new items
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
          quotation_id: params.id,
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
        return NextResponse.json({ error: itemsError.message }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from('quotations')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Fetch updated items
    const { data: updatedItems } = await supabase
      .from('quotation_items')
      .select('*')
      .eq('quotation_id', params.id)
      .order('row_number', { ascending: true });

    return NextResponse.json({
      quotation: data,
      items: updatedItems || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/quotations/[id] - Delete quotation
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

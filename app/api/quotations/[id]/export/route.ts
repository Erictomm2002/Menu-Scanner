import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/libs/supabase-client";
import { generateQuotationExcel } from "@/libs/quotation-generator";
import { QuotationItem } from "@/types/quotation";

// POST /api/quotations/[id]/export - Export quotation to Excel
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const [
      { data: quotation, error: quotationError },
      { data: items, error: itemsError },
    ] = await Promise.all([
      supabase.from("quotations").select("*").eq("id", params.id).single(),
      supabase
        .from("quotation_items")
        .select("*")
        .eq("quotation_id", params.id)
        .order("row_number", { ascending: true }),
    ]);

    if (quotationError) {
      return NextResponse.json(
        { error: quotationError.message },
        { status: 404 },
      );
    }

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }

    const productIds = (items || [])
      .filter((item) => item.product_id && !item.is_subproduct)
      .map((item) => item.product_id);

    let productImages: Record<string, { image_url: string | null; image_mime_type: string | null }> = {};
    
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from("products")
        .select("id, image_url, image_mime_type")
        .in("id", productIds);
      
      if (products) {
        productImages = products.reduce((acc, p) => {
          acc[p.id] = { image_url: p.image_url, image_mime_type: p.image_mime_type };
          return acc;
        }, {} as Record<string, { image_url: string | null; image_mime_type: string | null }>);
      }
    }

    const itemsWithImages: QuotationItem[] = (items || []).map((item) => {
      if (item.product_id && productImages[item.product_id] && !item.is_subproduct) {
        return {
          ...item,
          image_url: productImages[item.product_id].image_url,
          image_mime_type: productImages[item.product_id].image_mime_type,
        };
      }
      return item as QuotationItem;
    });

    const buffer = await generateQuotationExcel(quotation, itemsWithImages);

    // Generate filename
    const filename = `BaoGia_${quotation.quote_number}.xlsx`;

    // Return file - convert to Blob for NextResponse
    const blob = new Blob([new Uint8Array(buffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    return new NextResponse(blob, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET /api/quotations/[id]/export - Also support GET for easier testing
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return POST(request, context);
}

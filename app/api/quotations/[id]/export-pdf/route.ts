import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/libs/supabase-client";
import { generateQuotationExcelPdf } from "@/libs/quotation-generator";
import { excelBufferToPdfDirect, checkLibreOfficeAvailable } from "@/libs/excel-to-pdf-direct";
import type { QuotationItem } from "@/types/quotation";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check if LibreOffice is available
    const isAvailable = await checkLibreOfficeAvailable();
    if (!isAvailable) {
      return NextResponse.json(
        { error: "PDF export service unavailable - LibreOffice not installed on server" },
        { status: 503 }
      );
    }

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
        { status: 404 }
      );
    }

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }

    const productIds = (items || [])
      .filter((item) => item.product_id && !item.is_subproduct)
      .map((item) => item.product_id);

    let productImages: Record<
      string,
      { image_url: string | null; image_mime_type: string | null }
    > = {};

    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from("products")
        .select("id, image_url, image_mime_type")
        .in("id", productIds);

      if (products) {
        productImages = products.reduce((acc, p) => {
          acc[p.id] = {
            image_url: p.image_url,
            image_mime_type: p.image_mime_type,
          };
          return acc;
        }, {} as Record<string, { image_url: string | null; image_mime_type: string | null }>);
      }
    }

    const itemsWithImages: QuotationItem[] = (items || []).map((item) => {
      if (
        item.product_id &&
        productImages[item.product_id] &&
        !item.is_subproduct
      ) {
        return {
          ...item,
          image_url: productImages[item.product_id].image_url,
          image_mime_type: productImages[item.product_id].image_mime_type,
        };
      }
      return item as QuotationItem;
    });

    const excelBuffer = await generateQuotationExcelPdf(quotation, itemsWithImages);
    const pdfBuffer = await excelBufferToPdfDirect(excelBuffer);

    const filename = `BaoGia_${quotation.quote_number}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export PDF error:", error);

    const err = error as Error;
    // Check for LibreOffice not installed error
    if (err.message?.includes('LibreOffice not installed')) {
      return NextResponse.json(
        { error: "PDF export service unavailable - LibreOffice not installed on server" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return POST(request, context);
}
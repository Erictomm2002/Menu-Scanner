import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/libs/supabase-client';
import { Product, ProductWithCount } from '@/types/quotation';
import {
  uploadProductImage,
  extractImageFromFormData,
  IMAGE_CONFIG,
} from '@/libs/image-storage';

// GET /api/products - List products with subproducts count
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');
    const includeSubproducts = searchParams.get('include_subproducts') === 'true';

    let query: any;
    let subproductsTableExists = false;

    // Check if subproducts table exists by trying a simple query
    try {
      const { error } = await supabase
        .from('subproducts')
        .select('count', { count: 'exact', head: true })
        .limit(1);
      subproductsTableExists = !error;
    } catch (e) {
      subproductsTableExists = false;
    }

    if (includeSubproducts && subproductsTableExists) {
      // Include full subproducts data
      query = supabase
        .from('products')
        .select(`
          *,
          subproducts(*)
        `)
        .order('name', { ascending: true })
        .limit(limit);
    } else {
      // Just select products without subproducts (for backward compatibility)
      query = supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true })
        .limit(limit);
    }

    if (category && (category === 'software' || category === 'hardware')) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If subproducts table exists, fetch counts
    let products = data;
    if (subproductsTableExists && !includeSubproducts) {
      // Get subproduct counts for each product
      const productIds = data.map((p: any) => p.id);
      const { data: subproductsData } = await supabase
        .from('subproducts')
        .select('product_id')
        .in('product_id', productIds);

      const counts: Record<string, number> = {};
      if (subproductsData) {
        subproductsData.forEach((sp: any) => {
          counts[sp.product_id] = (counts[sp.product_id] || 0) + 1;
        });
      }

      products = data.map((product: any) => ({
        ...product,
        subproducts_count: counts[product.id] || 0,
      }));
    } else if (includeSubproducts && subproductsTableExists) {
      products = data.map((product: any) => ({
        ...product,
        subproducts: product.subproducts || [],
      }));
    }

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create product with optional subproducts and image upload
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const isFormData = contentType.includes('multipart/form-data');

    let body: any;
    let imageFile: File | null = null;

    if (isFormData) {
      // Handle FormData with image upload
      const formData = await request.formData();
      imageFile = extractImageFromFormData(formData);

      // Extract product data from FormData
      body = {} as Record<string, any>;
      formData.forEach((value, key) => {
        if (key !== 'image') {
          // Try to parse JSON values (for nested objects like subproducts)
          try {
            body[key] = JSON.parse(value as string);
          } catch {
            body[key] = value;
          }
        }
      });
    } else {
      // Handle JSON request (backward compatibility)
      body = await request.json();
    }

    const requiredFields = ['name', 'category', 'unit', 'price'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (
      body.category !== 'software' &&
      body.category !== 'hardware'
    ) {
      return NextResponse.json(
        { error: 'Category must be either "software" or "hardware"' },
        { status: 400 }
      );
    }

    const productData: any = {
      name: body.name,
      category: body.category,
      description: body.description || null,
      unit: body.unit,
      price: parseFloat(body.price),
    };

    // Create product first
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 400 });
    }

    // Handle image upload if provided
    if (imageFile) {
      try {
        const imageInfo = await uploadProductImage(imageFile, product.id);

        // Update product with image information
        const { data: updatedProduct, error: updateError } = await supabase
          .from('products')
          .update({
            image_url: imageInfo.url,
            image_path: imageInfo.path,
            image_name: imageInfo.name,
            image_size: imageInfo.size,
            image_mime_type: imageInfo.mimeType,
          })
          .eq('id', product.id)
          .select()
          .single();

        if (updateError) {
          console.error('Failed to update product with image info:', updateError);
          // Product was created but image info wasn't saved - log but continue
        } else {
          // Use the updated product with image info
          product.image_url = updatedProduct.image_url;
          product.image_path = updatedProduct.image_path;
          product.image_name = updatedProduct.image_name;
          product.image_size = updatedProduct.image_size;
          product.image_mime_type = updatedProduct.image_mime_type;
        }
      } catch (imageError) {
        // If image upload fails, delete the product to maintain consistency
        await supabase.from('products').delete().eq('id', product.id);
        const errorMessage = imageError instanceof Error ? imageError.message : 'Unknown error';
        return NextResponse.json({ error: `Image upload failed: ${errorMessage}` }, { status: 400 });
      }
    }

    // Check if subproducts table exists
    let subproductsTableExists = false;
    try {
      const { error } = await supabase
        .from('subproducts')
        .select('count', { count: 'exact', head: true })
        .limit(1);
      subproductsTableExists = !error;
    } catch (e) {
      subproductsTableExists = false;
    }

    // If subproducts are provided and table exists, create them
    if (subproductsTableExists && body.subproducts && Array.isArray(body.subproducts) && body.subproducts.length > 0) {
      const subproductsData = body.subproducts.map((sub: any) => ({
        product_id: product.id,
        name: sub.name,
        price: parseFloat(sub.price) || 0,
        unit: sub.unit || null,
      }));

      const { error: subproductError } = await supabase
        .from('subproducts')
        .insert(subproductsData);

      if (subproductError) {
        // Rollback: delete the product if subproducts creation fails
        await supabase.from('products').delete().eq('id', product.id);
        return NextResponse.json({ error: subproductError.message }, { status: 400 });
      }

      // Fetch the complete product with subproducts
      const { data: completeProduct } = await supabase
        .from('products')
        .select('*, subproducts(*)')
        .eq('id', product.id)
        .single();

      return NextResponse.json({ product: completeProduct }, { status: 201 });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

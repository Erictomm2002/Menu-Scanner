import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/libs/supabase-client';
import {
  uploadProductImage,
  deleteProductImage,
  updateProductImage,
  extractImageFromFormData,
  productToFormData,
} from '@/libs/image-storage';

// GET /api/products/[id] - Get single product with subproducts
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { searchParams } = new URL(request.url);
    const includeSubproducts = searchParams.get('include_subproducts') === 'true';

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

    if (includeSubproducts && subproductsTableExists) {
      // Get product with subproducts
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          subproducts(*)
        `)
        .eq('id', params.id)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      return NextResponse.json({ product: data });
    } else {
      // Get product without subproducts
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      return NextResponse.json({ product: data });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product with subproducts and image
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const contentType = request.headers.get('content-type') || '';
    const isFormData = contentType.includes('multipart/form-data');

    let body: any;
    let imageFile: File | null = null;
    let deleteImage = false;

    if (isFormData) {
      // Handle FormData with image upload
      const formData = await request.formData();
      imageFile = extractImageFromFormData(formData);
      deleteImage = formData.get('deleteImage') === 'true';

      // Extract product data from FormData
      body = {};
      formData.forEach((value, key) => {
        if (key !== 'image' && key !== 'deleteImage') {
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
      deleteImage = body.deleteImage === true;
    }

    // Fetch current product to get existing image info
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 404 });
    }

    // Update basic product fields
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.category !== undefined) {
      if (body.category !== 'software' && body.category !== 'hardware') {
        return NextResponse.json(
          { error: 'Category must be either "software" or "hardware"' },
          { status: 400 }
        );
      }
      updateData.category = body.category;
    }
    if (body.description !== undefined) updateData.description = body.description;
    if (body.unit !== undefined) updateData.unit = body.unit;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);

    // Handle image updates
    if (deleteImage) {
      // Delete existing image
      if (currentProduct.image_path) {
        await deleteProductImage(currentProduct.image_path);
      }
      updateData.image_url = null;
      updateData.image_path = null;
      updateData.image_name = null;
      updateData.image_size = null;
      updateData.image_mime_type = null;
    } else if (imageFile) {
      // Upload new image and delete old one
      try {
        const imageInfo = await updateProductImage(
          imageFile,
          params.id,
          currentProduct.image_path || undefined
        );
        updateData.image_url = imageInfo.url;
        updateData.image_path = imageInfo.path;
        updateData.image_name = imageInfo.name;
        updateData.image_size = imageInfo.size;
        updateData.image_mime_type = imageInfo.mimeType;
      } catch (imageError) {
        const errorMessage = imageError instanceof Error ? imageError.message : 'Unknown error';
        return NextResponse.json({ error: `Image upload failed: ${errorMessage}` }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
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

    // Handle subproducts update if provided and table exists
    if (subproductsTableExists && body.subproducts !== undefined) {
      // Delete existing subproducts
      await supabase
        .from('subproducts')
        .delete()
        .eq('product_id', params.id);

      // Create new subproducts
      if (body.subproducts.length > 0) {
        const subproductsData = body.subproducts.map((sub: any) => ({
          product_id: params.id,
          name: sub.name,
          price: parseFloat(sub.price) || 0,
          unit: sub.unit || null,
        }));

        const { error: subproductError } = await supabase
          .from('subproducts')
          .insert(subproductsData);

        if (subproductError) {
          return NextResponse.json({ error: subproductError.message }, { status: 400 });
        }
      }
    }

    // Fetch complete product with subproducts if table exists
    let product = data;
    if (subproductsTableExists) {
      const { data: completeProduct } = await supabase
        .from('products')
        .select('*, subproducts(*)')
        .eq('id', params.id)
        .single();

      if (completeProduct) {
        product = completeProduct;
      }
    }

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product with image cleanup (subproducts will cascade)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;

    // Fetch product first to get image path
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('image_path')
      .eq('id', params.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 404 });
    }

    // Delete the product (subproducts will cascade)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Clean up the image from storage
    if (product?.image_path) {
      await deleteProductImage(product.image_path);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

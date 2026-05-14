import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { generateUniqueSlug } from "@/lib/slugify";

// GET: List products
export async function GET() {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }

    return NextResponse.json({ products: data });
  } catch (err) {
    console.error("Products GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create product
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, price, images, category, category_id, gender, color_variants, stock, is_new, delivery_price, is_trending, is_coming_soon, compare_price, big_size_price, collection_slugs, recommended_product_ids } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }
    if (!price || price <= 0) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 });
    }

    const supabase = createServerClient();
    const slug = await generateUniqueSlug(supabase, name.trim());

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        price,
        images: images || [],
        category: category?.trim() || null,
        category_id: category_id || null,
        gender: gender || "unisex",
        color_variants: color_variants || {},
        delivery_price: delivery_price !== undefined && delivery_price !== null && delivery_price !== '' ? delivery_price : null,
        stock: stock || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
        is_new: is_new || false,
        is_trending: is_trending || false,
        is_coming_soon: is_coming_soon || false,
        compare_price: compare_price !== undefined && compare_price !== null && compare_price !== '' ? compare_price : null,
        big_size_price: big_size_price !== undefined && big_size_price !== null && big_size_price !== '' ? big_size_price : null,
        collection_slugs: Array.isArray(collection_slugs) ? collection_slugs : [],
        recommended_product_ids: Array.isArray(recommended_product_ids) ? recommended_product_ids : [],
        slug,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Product creation error:", error);
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch (err) {
    console.error("Products POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

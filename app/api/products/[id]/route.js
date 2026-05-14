import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

function toSlug(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(supabase, name, excludeId) {
  const base = toSlug(name);
  let slug = base;
  let counter = 2;
  while (true) {
    const { data } = await supabase.from("products").select("id").eq("slug", slug).neq("id", excludeId);
    if (!data || data.length === 0) break;
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

// PATCH: Update product
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createServerClient();

    const allowedFields = [
      "name",
      "description",
      "price",
      "images",
      "category",
      "category_id",
      "gender",
      "color_variants",
      "stock",
      "is_new",
      "is_active",
      "delivery_price",
      "is_trending",
      "is_coming_soon",
      "compare_price",
      "big_size_price",
      "collection_slugs",
      "recommended_product_ids",
    ];
    const updates = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    // Regenerate slug if name is being updated
    if (body.name?.trim()) {
      updates.slug = await generateUniqueSlug(supabase, body.name.trim(), id);
    }

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch (err) {
    console.error("Product PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete product
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Product DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

// POST: Create a new order
export async function POST(request) {
  try {
    const body = await request.json();
    const { customer_name, phone, phone2, governorate, address, note, items, total_amount } = body;

    // Validation
    if (!customer_name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!phone?.trim()) {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    }
    if (!governorate) {
      return NextResponse.json({ error: "Governorate is required" }, { status: 400 });
    }
    if (!address?.trim()) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }
    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Generate order number: YAZI-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const order_number = `YAZI-${dateStr}-${randomNum}`;

    // Create order
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        order_number,
        customer_name: customer_name.trim(),
        phone: phone.trim(),
        phone2: phone2?.trim() || null,
        governorate,
        address: address.trim(),
        note: note?.trim() || null,
        items,
        total_amount,
        status: "new",
        payment_status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Order creation error:", error);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Decrement stock for each item
    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .single();

      if (product?.stock) {
        const updatedStock = { ...product.stock };
        if (updatedStock[item.size] !== undefined) {
          updatedStock[item.size] = Math.max(0, updatedStock[item.size] - item.quantity);
        }
        await supabase
          .from("products")
          .update({ stock: updatedStock })
          .eq("id", item.product_id);
      }
    }

    return NextResponse.json({
      success: true,
      order_number: order.order_number,
      order_id: order.id,
    });
  } catch (err) {
    console.error("Order API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET: List orders (admin only)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const supabase = createServerClient();

    let query = supabase
      .from("orders")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    return NextResponse.json({ orders: data, total: count, page, limit });
  } catch (err) {
    console.error("Orders GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

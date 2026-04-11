import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

// GET: Dashboard stats
export async function GET() {
  try {
    const supabase = createServerClient();

    // Get order counts by status
    const { data: orders } = await supabase.from("orders").select("status, total_amount, payment_status, payment_received");

    const stats = {
      totalOrders: orders?.length || 0,
      newOrders: orders?.filter((o) => o.status === "new").length || 0,
      confirmedOrders: orders?.filter((o) => o.status === "confirmed").length || 0,
      shippedOrders: orders?.filter((o) => o.status === "shipped").length || 0,
      deliveredOrders: orders?.filter((o) => o.status === "delivered").length || 0,
      returnedOrders: orders?.filter((o) => o.status === "returned").length || 0,
      cancelledOrders: orders?.filter((o) => o.status === "cancelled").length || 0,
      totalRevenue: orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
      paidOrders: orders?.filter((o) => o.payment_status === "paid").length || 0,
      totalPaymentsReceived:
        orders?.reduce((sum, o) => sum + (o.payment_received || 0), 0) || 0,
    };

    // Get product count + low stock
    const { data: products } = await supabase.from("products").select("stock, is_active");
    stats.totalProducts = products?.filter((p) => p.is_active).length || 0;
    stats.lowStockProducts = products?.filter((p) => {
      if (!p.stock || !p.is_active) return false;
      return Object.values(p.stock).some((v) => v > 0 && v <= 3);
    }).length || 0;

    return NextResponse.json(stats);
  } catch (err) {
    console.error("Stats error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

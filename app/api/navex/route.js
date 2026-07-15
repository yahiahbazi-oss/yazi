import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import {
  createNavexDelivery,
  trackNavexDelivery,
  trackMultipleNavexDeliveries,
  deleteNavexDelivery,
  getPendingNavexDeliveries,
  convertOrderToNavexFormat,
} from "@/lib/navex";

// POST: Create delivery or track deliveries
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, orderId, trackingCode, trackingCodes } = body;

    const supabase = createServerClient();

    // Create delivery from order
    if (action === "create" && orderId) {
      // Fetch order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Check if already sent to delivery
      if (order.navex_tracking_code) {
        return NextResponse.json(
          { error: "Order already sent to delivery", trackingCode: order.navex_tracking_code },
          { status: 400 }
        );
      }

      // Convert order to Navex format
      const navexData = convertOrderToNavexFormat(order);

      // Send to Navex
      const result = await createNavexDelivery(navexData);

      if (result.success) {
        // Update order with tracking code
        await supabase
          .from("orders")
          .update({
            navex_tracking_code: result.trackingCode,
            navex_sent_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        return NextResponse.json({
          success: true,
          trackingCode: result.trackingCode,
          message: "Delivery created successfully",
        });
      }

      return NextResponse.json(
        { error: result.error || "Failed to create delivery" },
        { status: 500 }
      );
    }

    // Track single delivery
    if (action === "track" && trackingCode) {
      const result = await trackNavexDelivery(trackingCode, {
        include_prix: true,
        include_date: true,
      });

      if (result.success) {
        return NextResponse.json({
          success: true,
          tracking: result.tracking,
        });
      }

      return NextResponse.json(
        { error: result.error || "Failed to track delivery" },
        { status: 404 }
      );
    }

    // Track multiple deliveries
    if (action === "track-multiple" && trackingCodes?.length > 0) {
      const result = await trackMultipleNavexDeliveries(trackingCodes);

      if (result.success) {
        return NextResponse.json({
          success: true,
          total: result.total,
          results: result.results,
        });
      }

      return NextResponse.json(
        { error: result.error || "Failed to track deliveries" },
        { status: 500 }
      );
    }

    // Get pending deliveries
    if (action === "pending") {
      const result = await getPendingNavexDeliveries();

      if (result.success) {
        return NextResponse.json({
          success: true,
          total: result.total,
          deliveries: result.deliveries,
        });
      }

      return NextResponse.json(
        { error: result.error || "Failed to get pending deliveries" },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Navex API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Cancel/delete a delivery
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingCode = searchParams.get("code");

    if (!trackingCode) {
      return NextResponse.json({ error: "Tracking code required" }, { status: 400 });
    }

    const result = await deleteNavexDelivery(trackingCode);

    if (result.success) {
      // Update order in database
      const supabase = createServerClient();
      await supabase
        .from("orders")
        .update({
          navex_tracking_code: null,
          navex_sent_at: null,
        })
        .eq("navex_tracking_code", trackingCode);

      return NextResponse.json({
        success: true,
        message: "Delivery deleted successfully",
      });
    }

    return NextResponse.json(
      { error: result.error || "Failed to delete delivery" },
      { status: 500 }
    );
  } catch (err) {
    console.error("Navex DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

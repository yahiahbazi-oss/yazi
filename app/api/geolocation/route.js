import { NextResponse } from "next/server";
import { getUserLocation } from "@/lib/geolocation";

/**
 * GET /api/geolocation
 * Detect user's country and currency from IP/headers
 */
export async function GET(request) {
  try {
    const location = await getUserLocation(request);
    
    return NextResponse.json({
      success: true,
      ...location,
    });
  } catch (error) {
    console.error("Geolocation API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to detect location",
        // Fallback to Tunisia
        country: "TN",
        currency: "TND",
      },
      { status: 200 } // Return 200 even on error with fallback
    );
  }
}

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from("site_settings").select("key, value");
    const settings = {};
    (data || []).forEach(({ key, value }) => { settings[key] = value; });
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const supabase = createServerClient();
    const allowed = ["hero_video_url"];
    for (const key of allowed) {
      if (body[key] !== undefined) {
        await supabase
          .from("site_settings")
          .upsert({ key, value: String(body[key]), updated_at: new Date().toISOString() }, { onConflict: "key" });
      }
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

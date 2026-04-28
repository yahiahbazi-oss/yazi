import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createServerClient();
    const allowed = ["name", "slug", "emoji", "color", "text_color", "is_active", "sort_order"];
    const updates = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }
    const { data, error } = await supabase
      .from("collections")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    return NextResponse.json({ collection: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

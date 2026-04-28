import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .order("created_at");
    if (error) return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    return NextResponse.json({ collections: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, slug, emoji, color, text_color, sort_order, image_url } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const finalSlug = (slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("collections")
      .insert({
        name: name.trim(),
        slug: finalSlug,
        emoji: emoji?.trim() || "🏷️",
        color: color || "#18181b",
        text_color: text_color || "#ffffff",
        sort_order: sort_order || 0,
        image_url: image_url?.trim() || null,
      })
      .select()
      .single();
    if (error) {
      console.error("Collections POST error:", error);
      if (error.code === "23505") return NextResponse.json({ error: "Ce slug existe déjà" }, { status: 409 });
      if (error.code === "42P01") return NextResponse.json({ error: "Table 'collections' introuvable. Exécutez la migration SQL d'abord." }, { status: 500 });
      return NextResponse.json({ error: error.message || "Failed to create" }, { status: 500 });
    }
    return NextResponse.json({ collection: data });
  } catch (err) {
    console.error("Collections POST exception:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

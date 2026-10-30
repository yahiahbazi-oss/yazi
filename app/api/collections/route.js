import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ collections: [] });
}

export async function POST() {
  return NextResponse.json({ error: "Collections removed" }, { status: 410 });
}

import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await seedDatabase(body.force === true);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[Seed Error]", err);
    return NextResponse.json({ error: "Failed to seed database." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await seedDatabase(false);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[Seed GET Error]", err);
    return NextResponse.json({ error: "Failed to seed database." }, { status: 500 });
  }
}


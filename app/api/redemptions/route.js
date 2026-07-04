import { NextResponse } from "next/server";
import { listRedemptions, createRedemption } from "@/lib/queries";

export async function GET() {
  const redemptions = await listRedemptions();
  return NextResponse.json(redemptions);
}

export async function POST(req) {
  const body = await req.json();
  try {
    await createRedemption(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

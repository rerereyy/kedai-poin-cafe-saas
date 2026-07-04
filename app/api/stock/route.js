import { NextResponse } from "next/server";
import { listStock, createStock } from "@/lib/queries";

export async function GET() {
  const stock = await listStock();
  return NextResponse.json(stock);
}

export async function POST(req) {
  const body = await req.json();
  try {
    await createStock(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

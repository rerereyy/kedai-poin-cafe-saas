import { NextResponse } from "next/server";
import { listMenu, createMenu } from "@/lib/queries";

export async function GET() {
  const menu = await listMenu();
  return NextResponse.json(menu);
}

export async function POST(req) {
  const body = await req.json();
  try {
    const id = await createMenu(body);
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

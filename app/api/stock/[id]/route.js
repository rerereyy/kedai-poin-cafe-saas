import { NextResponse } from "next/server";
import { updateStock, deleteStock } from "@/lib/queries";

export async function PUT(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  try {
    await updateStock(id, body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  try {
    await deleteStock(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

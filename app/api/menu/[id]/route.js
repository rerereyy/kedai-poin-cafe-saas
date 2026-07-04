import { NextResponse } from "next/server";
import { deleteMenu } from "@/lib/queries";

export async function DELETE(_req, { params }) {
  const { id } = await params;
  try {
    await deleteMenu(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

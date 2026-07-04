import { NextResponse } from "next/server";
import { deleteCustomer } from "@/lib/queries";

export async function DELETE(_req, { params }) {
  const { id } = await params;
  try {
    await deleteCustomer(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

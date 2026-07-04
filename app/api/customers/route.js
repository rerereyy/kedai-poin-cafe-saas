import { NextResponse } from "next/server";
import { listCustomers, createCustomer } from "@/lib/queries";

export async function GET() {
  const customers = await listCustomers();
  return NextResponse.json(customers);
}

export async function POST(req) {
  const body = await req.json();
  try {
    await createCustomer(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

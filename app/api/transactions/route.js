import { NextResponse } from "next/server";
import { listTransactions, createTransaction } from "@/lib/queries";

export async function GET() {
  const tx = await listTransactions();
  return NextResponse.json(tx);
}

export async function POST(req) {
  const body = await req.json();
  try {
    const result = await createTransaction(body);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

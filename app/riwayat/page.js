import { listTransactions } from "@/lib/queries";

export const dynamic = "force-dynamic";

function formatRupiah(n) {
  return "Rp" + Number(n).toLocaleString("id-ID");
}

export default async function RiwayatPage() {
  const tx = await listTransactions();

  return (
    <div className="p-8 max-w-4xl">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-amber">Laporan</p>
        <h1 className="font-display text-4xl mt-1">Riwayat Transaksi</h1>
        <p className="text-ink/60 mt-2">Seluruh transaksi yang tercatat dari halaman Kasir.</p>
      </header>

      <div className="rounded-lg border border-line bg-paper overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-espresso text-parchment text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Waktu</th>
              <th className="text-left px-4 py-3">Pelanggan</th>
              <th className="text-left px-4 py-3">Menu</th>
              <th className="text-left px-4 py-3">Qty</th>
              <th className="text-left px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Poin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {tx.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 text-ink/50 text-xs">{t.created_at}</td>
                <td className="px-4 py-3">{t.customer_name || "Walk-in"}</td>
                <td className="px-4 py-3">{t.menu_name}</td>
                <td className="px-4 py-3">{t.quantity}</td>
                <td className="px-4 py-3">{formatRupiah(t.total_price)}</td>
                <td className="px-4 py-3 text-amber">{t.points_earned > 0 ? `+${t.points_earned}` : "-"}</td>
              </tr>
            ))}
            {tx.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink/40">
                  Belum ada transaksi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

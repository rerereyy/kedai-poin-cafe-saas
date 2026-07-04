import { getDashboardStats } from "@/lib/queries";
import StatCard from "@/components/StatCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatRupiah(n) {
  return "Rp" + Number(n).toLocaleString("id-ID");
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="p-8 max-w-5xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-amber">Dasbor</p>
        <h1 className="font-display text-4xl mt-1">Selamat pagi di kedai.</h1>
        <p className="text-ink/60 mt-2 max-w-xl">
          Ringkasan stok bahan baku dan aktivitas loyalitas pelanggan hari ini.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Jenis Bahan Baku" value={stats.stockCount} />
        <StatCard
          label="Bahan Menipis"
          value={stats.lowStock.length}
          tone={stats.lowStock.length > 0 ? "warn" : "good"}
        />
        <StatCard label="Total Pelanggan" value={stats.customerCount} />
        <StatCard
          label="Transaksi Hari Ini"
          value={stats.todayTxCount}
          sub={formatRupiah(stats.todayRevenue)}
        />
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Peringatan Stok Menipis</h2>
          <Link href="/stok" className="text-sm text-amber hover:underline">
            Kelola stok →
          </Link>
        </div>
        {stats.lowStock.length === 0 ? (
          <div className="rounded-lg border border-sage/30 bg-sage/5 px-5 py-6 text-sm text-ink/70">
            Semua bahan baku dalam jumlah aman. Tidak ada yang perlu direstok saat ini.
          </div>
        ) : (
          <div className="rounded-lg border border-line bg-paper divide-y divide-line overflow-hidden">
            {stats.lowStock.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-ink/50">
                    Sisa {item.quantity} {item.unit} · batas minimum {item.min_threshold} {item.unit}
                  </p>
                </div>
                <span className="text-xs font-medium text-rust bg-rust/10 px-2.5 py-1 rounded-full">
                  Segera restok
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/kasir"
          className="rounded-lg border border-line bg-espresso text-parchment px-5 py-5 hover:bg-espresso-deep transition-colors"
        >
          <p className="font-display text-lg">Buka Kasir →</p>
          <p className="text-sm text-parchment/60 mt-1">Catat penjualan baru</p>
        </Link>
        <Link
          href="/pelanggan"
          className="rounded-lg border border-line bg-paper px-5 py-5 hover:border-amber transition-colors"
        >
          <p className="font-display text-lg">Pelanggan →</p>
          <p className="text-sm text-ink/50 mt-1">Lihat saldo poin loyalitas</p>
        </Link>
        <Link
          href="/menu"
          className="rounded-lg border border-line bg-paper px-5 py-5 hover:border-amber transition-colors"
        >
          <p className="font-display text-lg">Menu →</p>
          <p className="text-sm text-ink/50 mt-1">Atur menu &amp; komposisi bahan</p>
        </Link>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function PelangganPage() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/customers");
    setCustomers(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    setName("");
    setPhone("");
    load();
  }

  async function remove(id) {
    if (!confirm("Hapus pelanggan ini?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-8 max-w-3xl">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-amber">Loyalty</p>
        <h1 className="font-display text-4xl mt-1">Pelanggan</h1>
        <p className="text-ink/60 mt-2">
          Kartu loyalti digital pengganti kartu kertas — poin bertambah otomatis setiap transaksi di Kasir.
        </p>
      </header>

      <form onSubmit={submit} className="rounded-lg border border-line bg-paper p-5 mb-8 flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-xs text-ink/50">Nama Pelanggan</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-md border border-line bg-white text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-ink/50">No. HP (opsional)</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-md border border-line bg-white text-sm"
          />
        </div>
        <button type="submit" className="px-4 py-2 rounded-md bg-amber text-white text-sm font-medium hover:bg-amber-light">
          Daftarkan
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-ink/50">Memuat...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customers.map((c) => (
            <div key={c.id} className="rounded-lg border border-line bg-paper p-5 flex items-center justify-between">
              <div>
                <p className="font-display text-lg">{c.name}</p>
                {c.phone && <p className="text-xs text-ink/50">{c.phone}</p>}
              </div>
              <div className="text-right">
                <p className="font-display text-2xl text-amber">{c.points}</p>
                <p className="text-[10px] uppercase tracking-wider text-ink/40">poin</p>
              </div>
              <button onClick={() => remove(c.id)} className="text-rust text-xs hover:underline ml-4">
                Hapus
              </button>
            </div>
          ))}
          {customers.length === 0 && <p className="text-sm text-ink/40">Belum ada pelanggan terdaftar.</p>}
        </div>
      )}
    </div>
  );
}

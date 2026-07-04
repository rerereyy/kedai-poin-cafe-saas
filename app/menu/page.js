"use client";

import { useEffect, useState } from "react";

export default function MenuPage() {
  const [menu, setMenu] = useState([]);
  const [stock, setStock] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [points, setPoints] = useState("1");
  const [rows, setRows] = useState([{ stock_item_id: "", qty_used: "" }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [menuRes, stockRes] = await Promise.all([fetch("/api/menu"), fetch("/api/stock")]);
    setMenu(await menuRes.json());
    setStock(await stockRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function updateRow(idx, field, value) {
    const next = [...rows];
    next[idx][field] = value;
    setRows(next);
  }

  function addRow() {
    setRows([...rows, { stock_item_id: "", qty_used: "" }]);
  }

  function removeRow(idx) {
    setRows(rows.filter((_, i) => i !== idx));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    const ingredients = rows
      .filter((r) => r.stock_item_id && r.qty_used)
      .map((r) => ({ stock_item_id: Number(r.stock_item_id), qty_used: Number(r.qty_used) }));

    const res = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price: Number(price), points_earned: Number(points), ingredients }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Gagal menyimpan");
      return;
    }
    setName("");
    setPrice("");
    setPoints("1");
    setRows([{ stock_item_id: "", qty_used: "" }]);
    load();
  }

  async function remove(id) {
    if (!confirm("Hapus menu ini?")) return;
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-8 max-w-4xl">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-amber">Katalog</p>
        <h1 className="font-display text-4xl mt-1">Menu Cafe</h1>
        <p className="text-ink/60 mt-2">
          Tentukan harga, poin loyalitas yang didapat pelanggan, dan bahan baku yang terpakai per porsi.
        </p>
      </header>

      <form onSubmit={submit} className="rounded-lg border border-line bg-paper p-5 mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-ink/50">Nama Menu</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="mis. Cafe Latte"
              className="w-full mt-1 px-3 py-2 rounded-md border border-line bg-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-ink/50">Harga (Rp)</label>
            <input
              required
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-md border border-line bg-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-ink/50">Poin per Pembelian</label>
            <input
              required
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-md border border-line bg-white text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-ink/50">Komposisi Bahan Baku (opsional, untuk potong stok otomatis)</label>
          <div className="space-y-2 mt-1">
            {rows.map((row, idx) => (
              <div key={idx} className="flex gap-2">
                <select
                  value={row.stock_item_id}
                  onChange={(e) => updateRow(idx, "stock_item_id", e.target.value)}
                  className="flex-1 px-3 py-2 rounded-md border border-line bg-white text-sm"
                >
                  <option value="">Pilih bahan...</option>
                  {stock.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.unit})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="any"
                  placeholder="Jumlah terpakai"
                  value={row.qty_used}
                  onChange={(e) => updateRow(idx, "qty_used", e.target.value)}
                  className="w-40 px-3 py-2 rounded-md border border-line bg-white text-sm"
                />
                <button type="button" onClick={() => removeRow(idx)} className="text-rust text-sm px-2">
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addRow} className="text-amber text-sm mt-2 hover:underline">
            + Tambah bahan
          </button>
        </div>

        <button type="submit" className="px-4 py-2 rounded-md bg-amber text-white text-sm font-medium hover:bg-amber-light">
          Simpan Menu
        </button>
        {error && <p className="text-sm text-rust">{error}</p>}
      </form>

      {loading ? (
        <p className="text-sm text-ink/50">Memuat...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menu.map((m) => (
            <div key={m.id} className="rounded-lg border border-line bg-paper p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-xl">{m.name}</p>
                  <p className="text-sm text-ink/60 mt-0.5">
                    Rp{Number(m.price).toLocaleString("id-ID")} · +{m.points_earned} poin
                  </p>
                </div>
                <button onClick={() => remove(m.id)} className="text-rust text-sm hover:underline">
                  Hapus
                </button>
              </div>
              {m.ingredients.length > 0 && (
                <ul className="mt-3 text-xs text-ink/50 space-y-1">
                  {m.ingredients.map((ing, i) => (
                    <li key={i}>
                      · {ing.qty_used} {ing.unit} {ing.stock_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {menu.length === 0 && <p className="text-sm text-ink/40">Belum ada menu.</p>}
        </div>
      )}
    </div>
  );
}

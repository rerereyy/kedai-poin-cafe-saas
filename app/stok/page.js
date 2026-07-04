"use client";

import { useEffect, useState } from "react";

const EMPTY = { name: "", unit: "", quantity: "", min_threshold: "" };

export default function StokPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/stock");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      unit: item.unit,
      quantity: item.quantity,
      min_threshold: item.min_threshold,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name,
      unit: form.unit,
      quantity: Number(form.quantity),
      min_threshold: Number(form.min_threshold),
    };
    const res = await fetch(editingId ? `/api/stock/${editingId}` : "/api/stock", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Gagal menyimpan");
      return;
    }
    cancelEdit();
    load();
  }

  async function remove(id) {
    if (!confirm("Hapus bahan baku ini?")) return;
    await fetch(`/api/stock/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-8 max-w-4xl">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-amber">Inventaris</p>
        <h1 className="font-display text-4xl mt-1">Stok Bahan Baku</h1>
        <p className="text-ink/60 mt-2">
          Catat bahan baku dan batas minimum. Stok otomatis berkurang setiap kali transaksi dicatat di Kasir.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="rounded-lg border border-line bg-paper p-5 mb-8 grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
      >
        <div className="md:col-span-2">
          <label className="text-xs text-ink/50">Nama Bahan</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="mis. Biji Kopi Arabika"
            className="w-full mt-1 px-3 py-2 rounded-md border border-line bg-white text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-ink/50">Satuan</label>
          <input
            required
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            placeholder="gram / ml / pcs"
            className="w-full mt-1 px-3 py-2 rounded-md border border-line bg-white text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-ink/50">Jumlah</label>
          <input
            required
            type="number"
            step="any"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-md border border-line bg-white text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-ink/50">Batas Minimum</label>
          <input
            required
            type="number"
            step="any"
            value={form.min_threshold}
            onChange={(e) => setForm({ ...form, min_threshold: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-md border border-line bg-white text-sm"
          />
        </div>
        <div className="md:col-span-5 flex gap-2">
          <button type="submit" className="px-4 py-2 rounded-md bg-amber text-white text-sm font-medium hover:bg-amber-light">
            {editingId ? "Simpan Perubahan" : "Tambah Bahan"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="px-4 py-2 rounded-md border border-line text-sm">
              Batal
            </button>
          )}
        </div>
        {error && <p className="md:col-span-5 text-sm text-rust">{error}</p>}
      </form>

      {loading ? (
        <p className="text-sm text-ink/50">Memuat...</p>
      ) : (
        <div className="rounded-lg border border-line bg-paper overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-espresso text-parchment text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Nama</th>
                <th className="text-left px-4 py-3">Jumlah</th>
                <th className="text-left px-4 py-3">Min.</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((item) => {
                const low = item.quantity <= item.min_threshold;
                return (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-4 py-3 text-ink/50">
                      {item.min_threshold} {item.unit}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          low ? "text-rust bg-rust/10" : "text-sage bg-sage/10"
                        }`}
                      >
                        {low ? "Menipis" : "Aman"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button onClick={() => startEdit(item)} className="text-amber hover:underline">
                        Ubah
                      </button>
                      <button onClick={() => remove(item.id)} className="text-rust hover:underline">
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-ink/40">
                    Belum ada bahan baku.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

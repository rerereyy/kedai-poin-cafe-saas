"use client";

import { useEffect, useState } from "react";

function formatRupiah(n) {
  return "Rp" + Number(n).toLocaleString("id-ID");
}

export default function KasirPage() {
  const [menu, setMenu] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [menuId, setMenuId] = useState("");
  const [qty, setQty] = useState("1");
  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const [menuRes, custRes] = await Promise.all([fetch("/api/menu"), fetch("/api/customers")]);
    setMenu(await menuRes.json());
    setCustomers(await custRes.json());
  }

  useEffect(() => {
    load();
  }, []);

  function addToCart() {
    setError("");
    const item = menu.find((m) => String(m.id) === menuId);
    if (!item) {
      setError("Pilih menu terlebih dahulu");
      return;
    }
    const quantity = Number(qty) || 1;
    setCart([...cart, { menu_item_id: item.id, name: item.name, price: item.price, points_earned: item.points_earned, quantity }]);
    setMenuId("");
    setQty("1");
  }

  function removeFromCart(idx) {
    setCart(cart.filter((_, i) => i !== idx));
  }

  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const totalPoints = customerId ? cart.reduce((sum, c) => sum + c.points_earned * c.quantity, 0) : 0;

  async function checkout() {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError("");
    try {
      for (const line of cart) {
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_id: customerId ? Number(customerId) : null,
            menu_item_id: line.menu_item_id,
            quantity: line.quantity,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Transaksi gagal");
        }
      }
      setDone({ total, points: totalPoints, count: cart.length });
      setCart([]);
      setCustomerId("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const customerName = customers.find((c) => String(c.id) === customerId)?.name;

  return (
    <div className="p-8 max-w-5xl">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-amber">Point of Sale</p>
        <h1 className="font-display text-4xl mt-1">Kasir</h1>
        <p className="text-ink/60 mt-2">
          Catat pesanan pelanggan. Stok bahan baku dan poin loyalitas akan diperbarui otomatis.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8">
        {/* Order form */}
        <div className="space-y-5">
          <div>
            <label className="text-xs text-ink/50">Pelanggan (opsional — kosongkan untuk walk-in)</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-md border border-line bg-white text-sm"
            >
              <option value="">Walk-in / tanpa poin</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.points} poin
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-line bg-paper p-5">
            <p className="text-sm font-medium mb-3">Tambah Item</p>
            <div className="flex gap-2">
              <select
                value={menuId}
                onChange={(e) => setMenuId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-md border border-line bg-white text-sm"
              >
                <option value="">Pilih menu...</option>
                {menu.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {formatRupiah(m.price)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-20 px-3 py-2 rounded-md border border-line bg-white text-sm"
              />
              <button
                onClick={addToCart}
                type="button"
                className="px-4 py-2 rounded-md bg-espresso text-parchment text-sm font-medium hover:bg-espresso-deep"
              >
                Tambah
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-rust">{error}</p>}

          {done && (
            <div className="rounded-lg border border-sage/30 bg-sage/5 px-5 py-4 text-sm">
              Transaksi berhasil dicatat: {done.count} item, total {formatRupiah(done.total)}
              {done.points > 0 && <> — pelanggan mendapat {done.points} poin.</>}
            </div>
          )}
        </div>

        {/* Signature receipt element */}
        <div className="bg-paper border border-line rounded-t-md shadow-sm px-5 pt-6 pb-4 font-data receipt-edge-bottom">
          <p className="text-center font-display text-lg tracking-wide">KEDAI POIN</p>
          <p className="text-center text-[10px] text-ink/50 uppercase tracking-[0.2em] mt-0.5 mb-4">
            Struk Sementara
          </p>
          <div className="border-t border-dashed border-ink/30 pt-3 text-xs space-y-2">
            <p>Pelanggan: {customerName || "Walk-in"}</p>
          </div>
          <div className="border-t border-dashed border-ink/30 mt-3 pt-3 space-y-2 min-h-[80px]">
            {cart.length === 0 && <p className="text-xs text-ink/30">Belum ada item.</p>}
            {cart.map((line, idx) => (
              <div key={idx} className="text-xs flex justify-between items-start gap-2">
                <span>
                  {line.quantity}× {line.name}
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  {formatRupiah(line.price * line.quantity)}
                  <button onClick={() => removeFromCart(idx)} className="text-rust">
                    ✕
                  </button>
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-ink/30 mt-3 pt-3 text-sm flex justify-between font-medium">
            <span>Total</span>
            <span>{formatRupiah(total)}</span>
          </div>
          {totalPoints > 0 && (
            <p className="text-xs text-amber mt-1">+{totalPoints} poin loyalitas</p>
          )}
          <button
            onClick={checkout}
            disabled={cart.length === 0 || submitting}
            className="w-full mt-4 py-2.5 rounded-md bg-amber text-white text-sm font-medium hover:bg-amber-light disabled:opacity-40"
          >
            {submitting ? "Memproses..." : "Selesaikan Transaksi"}
          </button>
        </div>
      </div>
    </div>
  );
}

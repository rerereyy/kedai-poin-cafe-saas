"use client";

import { useEffect, useState } from "react";

const REWARDS = [
  { name: "Gratis 1 Espresso", points: 10 },
  { name: "Gratis 1 Cafe Latte", points: 15 },
  { name: "Diskon 20% Menu Apapun", points: 8 },
];

export default function RedeemPage() {
  const [customers, setCustomers] = useState([]);
  const [history, setHistory] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [reward, setReward] = useState(REWARDS[0].name);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    const [custRes, redRes] = await Promise.all([fetch("/api/customers"), fetch("/api/redemptions")]);
    setCustomers(await custRes.json());
    setHistory(await redRes.json());
  }

  useEffect(() => {
    load();
  }, []);

  const selectedCustomer = customers.find((c) => String(c.id) === customerId);
  const selectedReward = REWARDS.find((r) => r.name === reward);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await fetch("/api/redemptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: Number(customerId),
        reward_name: reward,
        points_used: selectedReward.points,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Gagal menukar poin");
      return;
    }
    setSuccess(`${selectedCustomer.name} berhasil menukar ${selectedReward.points} poin untuk "${reward}".`);
    setCustomerId("");
    load();
  }

  return (
    <div className="p-8 max-w-3xl">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-amber">Loyalty</p>
        <h1 className="font-display text-4xl mt-1">Tukar Poin</h1>
        <p className="text-ink/60 mt-2">Pelanggan menukar poin yang terkumpul dengan reward.</p>
      </header>

      <form onSubmit={submit} className="rounded-lg border border-line bg-paper p-5 mb-8 space-y-4">
        <div>
          <label className="text-xs text-ink/50">Pelanggan</label>
          <select
            required
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-md border border-line bg-white text-sm"
          >
            <option value="">Pilih pelanggan...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.points} poin
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-ink/50">Reward</label>
          <select
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-md border border-line bg-white text-sm"
          >
            {REWARDS.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name} — {r.points} poin
              </option>
            ))}
          </select>
        </div>
        {selectedCustomer && selectedReward && (
          <p className="text-xs text-ink/50">
            Saldo saat ini {selectedCustomer.points} poin
            {selectedCustomer.points < selectedReward.points && (
              <span className="text-rust"> — poin tidak cukup untuk reward ini</span>
            )}
          </p>
        )}
        <button type="submit" className="px-4 py-2 rounded-md bg-amber text-white text-sm font-medium hover:bg-amber-light">
          Tukar Poin
        </button>
        {error && <p className="text-sm text-rust">{error}</p>}
        {success && <p className="text-sm text-sage">{success}</p>}
      </form>

      <h2 className="font-display text-xl mb-3">Riwayat Penukaran</h2>
      <div className="rounded-lg border border-line bg-paper divide-y divide-line overflow-hidden">
        {history.map((r) => (
          <div key={r.id} className="flex items-center justify-between px-5 py-3 text-sm">
            <div>
              <p className="font-medium">{r.customer_name}</p>
              <p className="text-xs text-ink/50">{r.reward_name}</p>
            </div>
            <div className="text-right">
              <p className="text-amber font-medium">-{r.points_used} poin</p>
              <p className="text-xs text-ink/40">{r.created_at}</p>
            </div>
          </div>
        ))}
        {history.length === 0 && <p className="px-5 py-6 text-center text-ink/40 text-sm">Belum ada penukaran.</p>}
      </div>
    </div>
  );
}

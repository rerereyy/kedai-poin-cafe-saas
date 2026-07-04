export default function StatCard({ label, value, sub, tone = "default" }) {
  const toneClasses = {
    default: "border-line",
    warn: "border-rust/40 bg-rust/5",
    good: "border-sage/40 bg-sage/5",
  };
  return (
    <div className={`rounded-lg border ${toneClasses[tone]} bg-paper px-5 py-4`}>
      <p className="text-xs uppercase tracking-[0.15em] text-ink/50">{label}</p>
      <p className="font-display text-3xl mt-1.5">{value}</p>
      {sub && <p className="text-xs text-ink/50 mt-1">{sub}</p>}
    </div>
  );
}

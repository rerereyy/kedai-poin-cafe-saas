"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dasbor", glyph: "☕" },
  { href: "/stok", label: "Stok Bahan", glyph: "▤" },
  { href: "/menu", label: "Menu", glyph: "▥" },
  { href: "/kasir", label: "Kasir", glyph: "▧" },
  { href: "/pelanggan", label: "Pelanggan", glyph: "◐" },
  { href: "/redeem", label: "Tukar Poin", glyph: "✦" },
  { href: "/riwayat", label: "Riwayat", glyph: "≡" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-espresso text-parchment min-h-screen flex flex-col">
      <div className="px-6 py-7 border-b border-white/10">
        <p className="font-display text-2xl leading-none tracking-tight">Kedai&nbsp;Poin</p>
        <p className="text-[11px] uppercase tracking-[0.2em] text-amber-light mt-2">
          Loyalty &amp; Stok Cafe
        </p>
      </div>
      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                active
                  ? "bg-amber text-white"
                  : "text-parchment/80 hover:bg-white/5 hover:text-parchment"
              }`}
            >
              <span className="w-4 text-center opacity-80">{item.glyph}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-5 border-t border-white/10 text-[11px] text-parchment/50 leading-relaxed">
        Studi kasus UAS SaaS
        <br />
        Manajemen stok &amp; loyalitas pelanggan cafe
      </div>
    </aside>
  );
}

import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Kedai Poin — Loyalty & Stok Cafe",
  description: "Sistem loyalty dan manajemen stok sederhana untuk cafe/coffee shop",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex bg-parchment text-ink">
        <Sidebar />
        <main className="flex-1 min-h-screen">{children}</main>
      </body>
    </html>
  );
}

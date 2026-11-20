"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

// Bagian client dari Navbar: menandai tautan aktif dan mengurus pencarian.
// Data user (nama dan role) dikirim dari Navbar.js (komponen server).
export default function NavbarKlien({ nama, role }) {
  const pathname = usePathname();
  const router = useRouter();
  const [kataKunci, setKataKunci] = useState("");

  const alamatProfil = role === "admin" ? "/profil-admin" : "/profil";

  const tautan = [
    { label: "Beranda", href: "/beranda" },
    { label: "Film", href: "/film" },
    { label: "Chatbot", href: "/chatbot" },
    { label: "Profil", href: alamatProfil },
  ];

  function aktif(href) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  function cari(e) {
    e.preventDefault();
    const q = kataKunci.trim();
    router.push(q ? `/film?q=${encodeURIComponent(q)}` : "/film");
  }

  const inisial = nama ? nama.trim().charAt(0).toUpperCase() : "";

  return (
    <nav className="flex h-16 items-center bg-[#0c0c0c] px-12">
      <Link href="/beranda" className="font-judul text-3xl text-merah">
        BOMING
      </Link>

      <div className="ml-4 flex items-center gap-1">
        {tautan.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={
              aktif(t.href)
                ? "rounded-full bg-[#333333] px-3 py-1.5 text-sm font-bold text-white"
                : "rounded-full px-3 py-1.5 text-sm text-white/70 hover:text-white"
            }
          >
            {t.label}
          </Link>
        ))}
      </div>

      <form onSubmit={cari} className="ml-auto">
        <input
          type="text"
          value={kataKunci}
          onChange={(e) => setKataKunci(e.target.value)}
          placeholder="Cari film..."
          className="h-[38px] w-60 rounded-md border border-[#333333] bg-[#222222] px-[15px] text-sm text-white outline-none placeholder:text-white/50"
        />
      </form>

      {inisial && (
        <div className="ml-3 flex h-8 w-8 items-center justify-center rounded bg-merah text-xs font-bold text-white">
          {inisial}
        </div>
      )}
    </nav>
  );
}

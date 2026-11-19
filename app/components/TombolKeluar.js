"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TombolKeluar() {
  const router = useRouter();
  const [proses, setProses] = useState(false);

  async function keluar() {
    setProses(true);
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={keluar}
      disabled={proses}
      className="h-[38px] rounded border border-white/30 px-4 text-sm font-bold leading-5 text-white hover:bg-white/10 disabled:opacity-50"
    >
      Keluar
    </button>
  );
}
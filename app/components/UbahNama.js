"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Kartu "Ubah nama tampilan". Dipakai di Profile User dan Profile Admin.
export default function UbahNama() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [proses, setProses] = useState(false);
  const [pesan, setPesan] = useState({ jenis: "", teks: "" });

  async function simpan(e) {
    e.preventDefault();
    setPesan({ jenis: "", teks: "" });
    setProses(true);
    try {
      const res = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama }),
      });
      const hasil = await res.json();
      if (!res.ok) {
        setPesan({ jenis: "error", teks: hasil.pesan || "Gagal menyimpan." });
        return;
      }
      setNama("");
      setPesan({ jenis: "ok", teks: "Nama berhasil diubah." });
      router.refresh();
    } catch {
      setPesan({ jenis: "error", teks: "Tidak bisa terhubung ke server." });
    } finally {
      setProses(false);
    }
  }

  return (
    <section className="rounded-lg bg-[#1a1a1a] p-5">
      <h2 className="text-base font-bold leading-6 text-white">
        Ubah nama tampilan
      </h2>
      <form onSubmit={simpan} className="mt-4 flex gap-2">
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          maxLength={50}
          placeholder="Nama baru"
          className="h-[50px] min-w-0 flex-1 rounded-md border border-[#333333] bg-[#222222] px-[15px] text-base text-white outline-none placeholder:text-white/50 focus:border-merah"
        />
        <button
          type="submit"
          disabled={proses}
          className="h-[50px] w-[99px] rounded bg-merah text-base font-bold text-white disabled:opacity-50"
        >
          Simpan
        </button>
      </form>
      {pesan.teks && (
        <p
          className={`mt-2 text-sm ${
            pesan.jenis === "error" ? "text-[#f86b70]" : "text-white/70"
          }`}
        >
          {pesan.teks}
        </p>
      )}
    </section>
  );
}

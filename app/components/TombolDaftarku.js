"use client";

import { useEffect, useState } from "react";

export default function TombolDaftarku({ idMovie }) {
  const [ada, setAda] = useState(null); // null = masih memuat
  const [proses, setProses] = useState(false);
  const [pesan, setPesan] = useState("");

  // Cek apakah film ini sudah ada di daftarku user.
  // Kalau belum login (401), anggap belum ada.
  useEffect(() => {
    let dibatalkan = false;

    fetch("/api/daftarku")
      .then(async (res) => {
        if (!res.ok) return { movies: [] };
        return res.json();
      })
      .then((hasil) => {
        if (dibatalkan) return;
        setAda(hasil.movies.some((m) => m.id_movie === idMovie));
      })
      .catch(() => {
        if (!dibatalkan) setAda(false);
      });

    return () => {
      dibatalkan = true;
    };
  }, [idMovie]);

  async function ubah() {
    setPesan("");
    setProses(true);
    try {
      const res = ada
        ? await fetch(`/api/daftarku/${idMovie}`, { method: "DELETE" })
        : await fetch("/api/daftarku", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_movie: idMovie }),
          });
      const hasil = await res.json();
      if (!res.ok) {
        setPesan(
          res.status === 401 ? "Masuk dulu untuk memakai daftarku." : hasil.pesan
        );
        return;
      }
      setAda(!ada);
    } catch {
      setPesan("Tidak bisa terhubung ke server.");
    } finally {
      setProses(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={ubah}
        disabled={proses || ada === null}
        className="flex h-11 items-center rounded-full bg-[#3a3a3a] px-6 text-base font-bold text-white disabled:opacity-60"
      >
        {ada ? "✓ Ada di daftarku" : "+ Tambah ke daftarku"}
      </button>
      {pesan && <span className="text-sm text-[#f86b70]">{pesan}</span>}
    </div>
  );
}

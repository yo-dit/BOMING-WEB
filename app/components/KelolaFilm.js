"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const KOSONG = {
  judul: "",
  sinopsis: "",
  genre: "",
  tahun: "",
  durasi: "",
  poster: "",
  video_url: "",
};

const kelasInput =
  "w-full rounded-md border border-[#333333] bg-[#222222] px-[15px] text-sm text-white outline-none placeholder:text-[#9ca3af] focus:border-merah";

// Satu kolom isian (label + input atau textarea)
function Isian({ id, label, nilai, onChange, placeholder, wajib = true, tinggi = false, autoFocus = false }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm leading-5 text-white">
        {label}
      </label>
      {tinggi ? (
        <textarea
          id={id}
          value={nilai}
          onChange={onChange}
          placeholder={placeholder}
          required={wajib}
          className={`${kelasInput} h-[98px] resize-none py-[13px] leading-5`}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={nilai}
          onChange={onChange}
          placeholder={placeholder}
          required={wajib}
          autoFocus={autoFocus}
          className={`${kelasInput} h-[46px]`}
        />
      )}
    </div>
  );
}

// Kotak jendela (dialog) dengan latar gelap di belakangnya
function Jendela({ idJudul, lebar, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={idJudul}
        className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] p-6"
        style={{ maxWidth: lebar }}
      >
        {children}
      </div>
    </div>
  );
}

export default function KelolaFilm() {
  const router = useRouter();
  const [films, setFilms] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [errorDaftar, setErrorDaftar] = useState("");
  const [jendela, setJendela] = useState(null); // null | "tambah" | "edit" | "hapus"
  const [dipilih, setDipilih] = useState(null);
  const [form, setForm] = useState(KOSONG);
  const [error, setError] = useState("");
  const [proses, setProses] = useState(false);
  const [versi, setVersi] = useState(0);

  // Memuat daftar film. Dijalankan saat halaman dibuka,
  // dan diulang setiap kali "versi" bertambah (setelah tambah, ubah, atau hapus).
  useEffect(() => {
    let dibatalkan = false;

    fetch("/api/movies")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.pesan);
        return data.movies;
      })
      .then((movies) => {
        if (dibatalkan) return;
        setFilms(movies);
        setErrorDaftar("");
      })
      .catch(() => {
        if (!dibatalkan) setErrorDaftar("Daftar film gagal dimuat.");
      })
      .finally(() => {
        if (!dibatalkan) setMemuat(false);
      });

    return () => {
      dibatalkan = true;
    };
  }, [versi]);

  const tutup = useCallback(() => {
    setJendela(null);
    setDipilih(null);
    setError("");
  }, []);

  // Tombol Escape menutup jendela
  useEffect(() => {
    if (!jendela) return;
    function tekan(e) {
      if (e.key === "Escape" && !proses) tutup();
    }
    window.addEventListener("keydown", tekan);
    return () => window.removeEventListener("keydown", tekan);
  }, [jendela, proses, tutup]);

  function ubah(nama) {
    return (e) => setForm((lama) => ({ ...lama, [nama]: e.target.value }));
  }

  function bukaTambah() {
    setForm(KOSONG);
    setError("");
    setDipilih(null);
    setJendela("tambah");
  }

  function bukaEdit(film) {
    setForm({
      judul: film.judul,
      sinopsis: film.sinopsis,
      genre: film.genre,
      tahun: String(film.tahun),
      durasi: String(film.durasi),
      poster: film.poster,
      video_url: film.video_url ?? "",
    });
    setError("");
    setDipilih(film);
    setJendela("edit");
  }

  function bukaHapus(film) {
    setError("");
    setDipilih(film);
    setJendela("hapus");
  }

  async function kirim(url, method, body) {
    setProses(true);
    setError("");
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.pesan || "Terjadi kesalahan.");
        return;
      }
      tutup();
      setVersi((v) => v + 1);
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setProses(false);
    }
  }

  function simpan(e) {
    e.preventDefault();
    if (jendela === "edit") {
      kirim(`/api/movies/${dipilih.id_movie}`, "PUT", form);
    } else {
      kirim("/api/movies", "POST", form);
    }
  }

  function hapus() {
    kirim(`/api/movies/${dipilih.id_movie}`, "DELETE");
  }

  return (
    <section className="pt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-judul text-2xl leading-8 text-white">Kelola film</h2>
        <button
          type="button"
          onClick={bukaTambah}
          className="rounded bg-merah px-4 py-2 text-sm font-bold leading-5 text-white hover:opacity-90"
        >
          Tambah film
        </button>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg bg-[#1a1a1a]">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[40px_minmax(0,1fr)_140px_80px_160px] items-center gap-4 border-b border-white/10 px-5 py-3 text-sm leading-5 text-white/60">
            <span className="whitespace-nowrap">Poster</span>
            <span>Judul</span>
            <span>Genre</span>
            <span>Tahun</span>
            <span>Aksi</span>
          </div>

          {memuat && (
            <p className="px-5 py-6 text-sm text-white/60">Memuat daftar film...</p>
          )}
          {!memuat && errorDaftar && (
            <p className="px-5 py-6 text-sm text-red-400">{errorDaftar}</p>
          )}
          {!memuat && !errorDaftar && films.length === 0 && (
            <p className="px-5 py-6 text-sm text-white/60">Belum ada film.</p>
          )}

          <div className="divide-y divide-white/10">
            {films.map((film) => (
              <div
                key={film.id_movie}
                className="grid grid-cols-[40px_minmax(0,1fr)_140px_80px_160px] items-center gap-4 px-5 py-3"
              >
                <div className="relative h-14 w-10 overflow-hidden rounded border border-white/10 bg-[#333333]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={film.poster}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <span className="truncate text-sm font-bold leading-5 text-white">
                  {film.judul}
                </span>
                <span className="truncate text-sm leading-5 text-white/75">
                  {film.genre}
                </span>
                <span className="text-sm leading-5 text-white/75">{film.tahun}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => bukaEdit(film)}
                    className="rounded border border-white/30 px-3 py-1.5 text-sm font-bold leading-5 text-white hover:bg-white/10"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => bukaHapus(film)}
                    className="rounded border border-[#f86b70]/50 px-3 py-1.5 text-sm font-bold leading-5 text-[#f86b70] hover:bg-[#f86b70]/10"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(jendela === "tambah" || jendela === "edit") && (
        <Jendela idJudul="judul-jendela-film" lebar={480}>
          <form onSubmit={simpan} className="space-y-4">
            <h2
              id="judul-jendela-film"
              className="font-judul text-2xl leading-8 text-white"
            >
              {jendela === "edit" ? "Edit film" : "Tambah film"}
            </h2>

            <Isian id="film-judul" label="Judul" nilai={form.judul} onChange={ubah("judul")} placeholder="Judul film" autoFocus />
            <Isian id="film-sinopsis" label="Sinopsis" nilai={form.sinopsis} onChange={ubah("sinopsis")} placeholder="Ringkasan cerita film" tinggi />
            <Isian id="film-genre" label="Genre" nilai={form.genre} onChange={ubah("genre")} placeholder="Contoh: Drama" />

            <div className="grid grid-cols-2 gap-2">
              <Isian id="film-tahun" label="Tahun" nilai={form.tahun} onChange={ubah("tahun")} placeholder="2024" />
              <Isian id="film-durasi" label="Durasi (menit)" nilai={form.durasi} onChange={ubah("durasi")} placeholder="120" />
            </div>

            <Isian id="film-poster" label="Link poster" nilai={form.poster} onChange={ubah("poster")} placeholder="https://..." />
            <Isian id="film-video" label="Link video (opsional)" nilai={form.video_url} onChange={ubah("video_url")} placeholder="Boleh dikosongkan" wajib={false} />

            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={tutup}
                disabled={proses}
                className="rounded border border-white/30 px-4 py-2 text-sm font-bold leading-5 text-white hover:bg-white/10 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={proses}
                className="rounded bg-merah px-4 py-2 text-sm font-bold leading-5 text-white hover:opacity-90 disabled:opacity-50"
              >
                {proses ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </Jendela>
      )}

      {jendela === "hapus" && dipilih && (
        <Jendela idJudul="judul-jendela-hapus" lebar={400}>
          <div className="space-y-4">
            <h2
              id="judul-jendela-hapus"
              className="font-judul text-2xl leading-8 text-white"
            >
              Hapus film?
            </h2>
            <p className="text-base leading-6 text-white/75">
              Film &quot;{dipilih.judul}&quot; akan dihapus beserta komentar dan
              ratingnya. Tindakan ini tidak bisa dibatalkan.
            </p>

            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={tutup}
                disabled={proses}
                className="rounded border border-white/30 px-4 py-2 text-sm font-bold leading-5 text-white hover:bg-white/10 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={hapus}
                disabled={proses}
                className="rounded bg-merah px-4 py-2 text-sm font-bold leading-5 text-white hover:opacity-90 disabled:opacity-50"
              >
                {proses ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </Jendela>
      )}
    </section>
  );
}
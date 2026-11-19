"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const daftarKolom = [
  { name: "nama", label: "Nama", type: "text", placeholder: "Nama lengkap", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", placeholder: "nama@email.com", autoComplete: "email" },
  { name: "password", label: "Kata sandi", type: "password", placeholder: "Minimal 6 karakter", autoComplete: "new-password" },
  { name: "ulangi", label: "Ulangi kata sandi", type: "password", placeholder: "", autoComplete: "new-password" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nama: "", email: "", password: "", ulangi: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function ubahIsian(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function kirimForm(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.ulangi) {
      setError("Kata sandi tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: form.nama,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.pesan || "Pendaftaran gagal.");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,#4a0c10_0%,#0c0c0c_55%)] px-4 py-10">
      <div className="w-full max-w-sm rounded-lg border border-white/10 bg-black/70 p-8">
        <p className="font-judul text-[30px] leading-[36px] text-merah">BOMING</p>
        <h1 className="pt-4 font-judul text-[30px] leading-[36px] text-white">
          Buat akun
        </h1>

        <form onSubmit={kirimForm}>
          <div className="space-y-4 pt-5">
            {daftarKolom.map((kolom) => (
              <div key={kolom.name}>
                <label
                  htmlFor={kolom.name}
                  className="mb-1 block text-sm leading-5 text-white"
                >
                  {kolom.label}
                </label>
                <input
                  id={kolom.name}
                  name={kolom.name}
                  type={kolom.type}
                  value={form[kolom.name]}
                  onChange={ubahIsian}
                  placeholder={kolom.placeholder}
                  autoComplete={kolom.autoComplete}
                  required
                  className="h-[46px] w-full rounded-md border border-[#333333] bg-[#222222] px-[14px] text-sm text-white outline-none placeholder:text-[#9ca3af] focus:border-merah"
                />
              </div>
            ))}
          </div>

          {error && (
            <p role="alert" className="pt-4 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded bg-merah text-base font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </div>
        </form>

        <p className="pt-5 text-sm leading-5 text-white/70">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-white underline">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
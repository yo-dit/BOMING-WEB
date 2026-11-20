"use client";

import Link from "next/link";

export default function KartuFilm({ film, denganInfo = false, penuh = false }) {
  const ukuran = penuh ? "aspect-[2/3] w-full" : "h-66 w-44";

  return (
    <Link
      href={`/film/${film.id_movie}`}
      className={penuh ? "block" : "block w-44 shrink-0"}
    >
      <div
        className={`relative overflow-hidden rounded-md border border-white/10 bg-linear-to-br from-[#555555] to-[#1a1a1a] ${ukuran}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={film.poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-transparent to-transparent" />
        <span className="absolute bottom-3 left-3 right-3 font-judul text-lg uppercase leading-tight text-white">
          {film.judul}
        </span>
      </div>

      {denganInfo && (
        <div className="mt-2">
          <p className="truncate text-sm text-white">{film.judul}</p>
          <p className="text-xs text-white/60">
            {film.genre} {"\u00b7"} {film.tahun}
          </p>
        </div>
      )}
    </Link>
  );
}
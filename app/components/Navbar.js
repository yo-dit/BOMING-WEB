import { Suspense } from "react";
import { prisma } from "../../lib/prisma";
import { ambilSession } from "../../lib/session";
import NavbarKlien from "./NavbarKlien";

// Bar navigasi untuk halaman yang memakainya di Figma.
// Tanpa properti: sesi dibaca sendiri, jadi dibungkus <Suspense>.
export default function Navbar() {
  return (
    <Suspense fallback={<div className="h-16 bg-[#0c0c0c]" />}>
      <IsiNavbar />
    </Suspense>
  );
}

async function IsiNavbar() {
  const session = await ambilSession();

  let user = null;
  if (session) {
    // Nama diambil dari database (bukan cookie), supaya ikut berubah
    // setelah user mengubah nama tampilan.
    user = await prisma.user.findUnique({
      where: { id_user: session.id_user },
      select: { nama: true, role: true },
    });
  }

  return <NavbarKlien nama={user?.nama ?? ""} role={user?.role ?? "user"} />;
}

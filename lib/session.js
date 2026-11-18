import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const kunci = new TextEncoder().encode(process.env.AUTH_SECRET);
const NAMA_COOKIE = "boming_session";
const MASA_BERLAKU = 60 * 60 * 24 * 7; // 7 hari

export async function buatSession(user) {
  const token = await new SignJWT({ id_user: user.id_user, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(kunci);

  const cookieStore = await cookies();
  cookieStore.set(NAMA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MASA_BERLAKU,
    path: "/",
  });
}

export async function ambilSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(NAMA_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, kunci);
    return payload;
  } catch {
    return null;
  }
}

export async function hapusSession() {
  const cookieStore = await cookies();
  cookieStore.delete(NAMA_COOKIE);
}
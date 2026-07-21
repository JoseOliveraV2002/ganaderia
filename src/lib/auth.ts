import { cookies } from "next/headers";
import { db } from "@/db";
import { productores } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const SECRET = process.env.AUTH_SECRET || "dev-secret-cambiar-en-produccion";
const COOKIE_NAME = "ganadera_session";

function sign(payload: string) {
  const hmac = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${hmac}`;
}

function verify(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx === -1) return null;
  const payload = token.slice(0, idx);
  const hmac = token.slice(idx + 1);
  const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  if (hmac !== expected) return null;
  return payload;
}

export async function login(email: string, password: string) {
  const [productor] = await db
    .select()
    .from(productores)
    .where(eq(productores.email, email));

  if (!productor) return null;
  const valido = await bcrypt.compare(password, productor.passwordHash);
  if (!valido) return null;

  const payload = JSON.stringify({
    id: productor.id,
    nombre: productor.nombre,
    rol: productor.rol,
  });
  const token = sign(payload);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  return productor;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSesion(): Promise<{
  id: number;
  nombre: string;
  rol: "productor" | "superadmin";
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verify(token);
  if (!payload) return null;
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

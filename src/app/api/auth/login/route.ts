import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
  }
  const productor = await login(email, password);
  if (!productor) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }
  return NextResponse.json({
    id: productor.id,
    nombre: productor.nombre,
    rol: productor.rol,
  });
}

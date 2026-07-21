import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productos } from "@/db/schema";
import { getSesion } from "@/lib/auth";
import { eq } from "drizzle-orm";

async function verificarPropietario(id: number, sesionId: number, rol: string) {
  const [producto] = await db.select().from(productos).where(eq(productos.id, id));
  if (!producto) return { ok: false, status: 404, msg: "Producto no encontrado" };
  if (rol !== "superadmin" && producto.productorId !== sesionId) {
    return { ok: false, status: 403, msg: "No puedes modificar productos de otro productor" };
  }
  return { ok: true, producto };
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sesion = await getSesion();
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const idNum = Number(id);
  const check = await verificarPropietario(idNum, sesion.id, sesion.rol);
  if (!check.ok) return NextResponse.json({ error: check.msg }, { status: check.status });

  const body = await req.json();
  const { nombre, categoriaOrigen, tipo, precio, stock, unidad, fechaVencimiento, fotoUrl } = body;

  const [actualizado] = await db
    .update(productos)
    .set({
      ...(nombre !== undefined && { nombre }),
      ...(categoriaOrigen !== undefined && { categoriaOrigen }),
      ...(tipo !== undefined && { tipo }),
      ...(precio !== undefined && { precio, precioFinal: precio }),
      ...(stock !== undefined && { stock }),
      ...(unidad !== undefined && { unidad }),
      ...(fechaVencimiento !== undefined && { fechaVencimiento }),
      ...(fotoUrl !== undefined && { fotoUrl }),
    })
    .where(eq(productos.id, idNum))
    .returning();

  return NextResponse.json(actualizado);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sesion = await getSesion();
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const idNum = Number(id);
  const check = await verificarPropietario(idNum, sesion.id, sesion.rol);
  if (!check.ok) return NextResponse.json({ error: check.msg }, { status: check.status });

  await db.delete(productos).where(eq(productos.id, idNum));
  return NextResponse.json({ ok: true });
}

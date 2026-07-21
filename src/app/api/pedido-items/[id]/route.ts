import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pedidoItems } from "@/db/schema";
import { getSesion } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sesion = await getSesion();
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const idNum = Number(id);
  const { estado } = await req.json();

  const estadosValidos = ["Pendiente", "En Preparacion", "Listo", "Entregado"];
  if (!estadosValidos.includes(estado)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const [item] = await db.select().from(pedidoItems).where(eq(pedidoItems.id, idNum));
  if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (sesion.rol !== "superadmin" && item.productorId !== sesion.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const [actualizado] = await db
    .update(pedidoItems)
    .set({ estado })
    .where(eq(pedidoItems.id, idNum))
    .returning();

  return NextResponse.json(actualizado);
}

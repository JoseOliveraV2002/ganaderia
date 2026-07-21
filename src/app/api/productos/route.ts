import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productos, productores } from "@/db/schema";
import { getSesion } from "@/lib/auth";
import { eq } from "drizzle-orm";

// GET /api/productos?origen=Vacuno&tipo=Lacteo&mios=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const origen = searchParams.get("origen");
  const tipo = searchParams.get("tipo");
  const soloMios = searchParams.get("mios") === "1";

  let query = db
    .select({
      id: productos.id,
      productorId: productos.productorId,
      nombre: productos.nombre,
      categoriaOrigen: productos.categoriaOrigen,
      tipo: productos.tipo,
      precio: productos.precio,
      precioFinal: productos.precioFinal,
      stock: productos.stock,
      unidad: productos.unidad,
      fechaVencimiento: productos.fechaVencimiento,
      fotoUrl: productos.fotoUrl,
      descuentoActivo: productos.descuentoActivo,
      porcentajeDescuento: productos.porcentajeDescuento,
      productorNombre: productores.nombre,
    })
    .from(productos)
    .leftJoin(productores, eq(productos.productorId, productores.id))
    .$dynamic();

  const filas = await query;

  let resultado = filas;

  if (soloMios) {
    const sesion = await getSesion();
    if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    resultado = resultado.filter((p) => p.productorId === sesion.id);
  }

  if (origen) resultado = resultado.filter((p) => p.categoriaOrigen === origen);
  if (tipo) resultado = resultado.filter((p) => p.tipo === tipo);

  return NextResponse.json(resultado);
}

// POST /api/productos - crea un producto (requiere sesion de productor)
export async function POST(req: NextRequest) {
  const sesion = await getSesion();
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const { nombre, categoriaOrigen, tipo, precio, stock, unidad, fechaVencimiento, fotoUrl } = body;

  if (!nombre || !categoriaOrigen || !tipo || precio == null || !fechaVencimiento) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const [creado] = await db
    .insert(productos)
    .values({
      productorId: sesion.id,
      nombre,
      categoriaOrigen,
      tipo,
      precio,
      precioFinal: precio,
      stock: stock ?? 0,
      unidad: unidad ?? "kg",
      fechaVencimiento,
      fotoUrl: fotoUrl || null,
    })
    .returning();

  return NextResponse.json(creado, { status: 201 });
}

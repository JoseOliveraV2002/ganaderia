import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pedidos, pedidoItems, productos } from "@/db/schema";
import { getSesion } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";

interface ItemCarrito {
  productoId: number;
  cantidad: number;
}

// POST /api/pedidos - checkout público
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clienteNombre, clienteContacto, tipoEntrega, direccion, metodoPago, items } = body as {
    clienteNombre: string;
    clienteContacto: string;
    tipoEntrega: "recojo" | "domicilio";
    direccion?: string;
    metodoPago: "culqi_tarjeta" | "contra_entrega";
    items: ItemCarrito[];
  };

  if (!clienteNombre || !clienteContacto || !tipoEntrega || !metodoPago || !items?.length) {
    return NextResponse.json({ error: "Faltan datos del pedido" }, { status: 400 });
  }
  if (tipoEntrega === "domicilio" && !direccion) {
    return NextResponse.json({ error: "La dirección es obligatoria para envío a domicilio" }, { status: 400 });
  }

  const ids = items.map((i) => i.productoId);
  const productosDb = await db.select().from(productos).where(inArray(productos.id, ids));

  let total = 0;
  const lineas: {
    productoId: number;
    productorId: number;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
  }[] = [];

  for (const item of items) {
    const producto = productosDb.find((p) => p.id === item.productoId);
    if (!producto) continue;
    if (producto.stock < item.cantidad) {
      return NextResponse.json(
        { error: `Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock})` },
        { status: 409 }
      );
    }
    const subtotal = producto.precioFinal * item.cantidad;
    total += subtotal;
    lineas.push({
      productoId: producto.id,
      productorId: producto.productorId,
      nombreProducto: producto.nombre,
      cantidad: item.cantidad,
      precioUnitario: producto.precioFinal,
    });
  }

  if (!lineas.length) {
    return NextResponse.json({ error: "El carrito está vacío o los productos ya no existen" }, { status: 400 });
  }

  const [pedido] = await db
    .insert(pedidos)
    .values({
      clienteNombre,
      clienteContacto,
      tipoEntrega,
      direccion: direccion || null,
      metodoPago,
      total: Math.round(total * 100) / 100,
    })
    .returning();

  for (const linea of lineas) {
    await db.insert(pedidoItems).values({
      pedidoId: pedido.id,
      productoId: linea.productoId,
      productorId: linea.productorId,
      nombreProducto: linea.nombreProducto,
      cantidad: linea.cantidad,
      precioUnitario: linea.precioUnitario,
    });
    // descuenta stock
    const producto = productosDb.find((p) => p.id === linea.productoId)!;
    await db
      .update(productos)
      .set({ stock: producto.stock - linea.cantidad })
      .where(eq(productos.id, linea.productoId));
  }

  return NextResponse.json({ ...pedido, items: lineas }, { status: 201 });
}

// GET /api/pedidos - panel admin, scoped por productor (RF-05)
export async function GET() {
  const sesion = await getSesion();
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const todosPedidos = await db.select().from(pedidos).orderBy(pedidos.creadoEn);
  const todosItems = await db.select().from(pedidoItems);

  const resultado = todosPedidos
    .map((pedido) => {
      const itemsDelPedido = todosItems.filter((i) => {
        if (i.pedidoId !== pedido.id) return false;
        if (sesion.rol === "superadmin") return true;
        return i.productorId === sesion.id;
      });
      return { ...pedido, items: itemsDelPedido };
    })
    .filter((p) => p.items.length > 0)
    .reverse();

  return NextResponse.json(resultado);
}

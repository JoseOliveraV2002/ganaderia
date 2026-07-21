import { db } from "@/db";
import { productos, reglasDescuento } from "@/db/schema";
import { eq, or } from "drizzle-orm";

/**
 * Revisa todos los productos y aplica descuentos automáticos según las reglas
 * configuradas por cada productor (RF-02). En producción esto se ejecuta
 * desde un cron job en el servidor EC2 (crontab) cada hora.
 * Aquí se expone también como endpoint manual para poder verse/probarse en la demo.
 */
export async function aplicarDescuentosAutomaticos() {
  const todosLosProductos = await db.select().from(productos);
  const todasLasReglas = await db.select().from(reglasDescuento);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const resultados: {
    productoId: number;
    nombre: string;
    accion: string;
  }[] = [];

  for (const producto of todosLosProductos) {
    const vencimiento = new Date(producto.fechaVencimiento);
    vencimiento.setHours(0, 0, 0, 0);
    const diasRestantes = Math.ceil(
      (vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Busca una regla del mismo productor que aplique a este tipo de producto
    const regla = todasLasReglas.find(
      (r) =>
        r.productorId === producto.productorId &&
        r.activa &&
        (r.tipoAplica === "Todos" || r.tipoAplica === producto.tipo)
    );

    if (!regla) continue;

    const debeAplicarDescuento = diasRestantes <= regla.diasParaVencer;

    if (debeAplicarDescuento && !producto.descuentoActivo) {
      const nuevoPrecio =
        producto.precio * (1 - regla.porcentajeDescuento / 100);

      await db
        .update(productos)
        .set({
          descuentoActivo: true,
          porcentajeDescuento: regla.porcentajeDescuento,
          precioFinal: Math.round(nuevoPrecio * 100) / 100,
        })
        .where(eq(productos.id, producto.id));

      resultados.push({
        productoId: producto.id,
        nombre: producto.nombre,
        accion: `Descuento del ${regla.porcentajeDescuento}% aplicado (vence en ${diasRestantes} día(s)) -> Liquidación por Stock`,
      });
    } else if (!debeAplicarDescuento && producto.descuentoActivo) {
      // Si por algún motivo ya no aplica (ej. se actualizó la fecha), revierte
      await db
        .update(productos)
        .set({
          descuentoActivo: false,
          porcentajeDescuento: 0,
          precioFinal: producto.precio,
        })
        .where(eq(productos.id, producto.id));

      resultados.push({
        productoId: producto.id,
        nombre: producto.nombre,
        accion: "Descuento removido (ya no cumple la regla)",
      });
    }
  }

  return resultados;
}

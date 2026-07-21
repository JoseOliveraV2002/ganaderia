"use client";

import { useState } from "react";
import Image from "next/image";
import { Producto } from "@/lib/types";
import { useCarrito } from "./CarritoContext";

function diasParaVencer(fecha: string) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const venc = new Date(fecha);
  venc.setHours(0, 0, 0, 0);
  return Math.ceil((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

export default function ProductoCard({ producto }: { producto: Producto }) {
  const { agregar } = useCarrito();
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const dias = diasParaVencer(producto.fechaVencimiento);
  const sinStock = producto.stock <= 0;

  function handleAgregar() {
    agregar(
      {
        productoId: producto.id,
        nombre: producto.nombre,
        precioUnitario: producto.precioFinal,
        stockDisponible: producto.stock,
        unidad: producto.unidad,
        fotoUrl: producto.fotoUrl,
      },
      cantidad
    );
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1200);
  }

  return (
    <div className="bg-white rounded-2xl border border-pasto-900/10 overflow-hidden flex flex-col group">
      <div className="relative aspect-[4/3] bg-hueso-dim overflow-hidden">
        {producto.fotoUrl && (
          <Image
            src={producto.fotoUrl}
            alt={producto.nombre}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        )}
        {producto.descuentoActivo && (
          <div className="tag-liquidacion absolute top-2 left-2 bg-cuero text-hueso text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded">
            -{producto.porcentajeDescuento}% · Liquidación
          </div>
        )}
        <div className="absolute top-2 right-2 bg-carbon/80 text-hueso text-[11px] px-2 py-0.5 rounded-full">
          {producto.categoriaOrigen}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold leading-snug" style={{ fontFamily: "'Fraunces', serif" }}>
          {producto.nombre}
        </h3>
        <p className="text-xs text-carbon/60">
          {producto.tipo === "Lacteo" ? "Lácteo" : "Carne"} · {producto.stock} {producto.unidad}
          {producto.stock !== 1 ? "s" : ""} disponibles
        </p>
        <p className={`text-xs font-medium ${dias <= 3 ? "text-cuero" : "text-carbon/50"}`}>
          {dias > 0 ? `Vence en ${dias} día${dias !== 1 ? "s" : ""}` : "Vence hoy"}
        </p>

        <div className="mt-auto pt-2 flex items-end justify-between gap-2">
          <div className="font-mono">
            {producto.descuentoActivo && (
              <span className="text-xs line-through text-carbon/40 mr-1.5">
                S/ {producto.precio.toFixed(2)}
              </span>
            )}
            <span className="text-lg font-semibold text-pasto-950">
              S/ {producto.precioFinal.toFixed(2)}
            </span>
            <span className="text-xs text-carbon/50">/{producto.unidad}</span>
          </div>
        </div>

        {sinStock ? (
          <div className="text-center text-sm text-carbon/40 border border-dashed border-carbon/20 rounded-lg py-2">
            Sin stock
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-carbon/15 rounded-lg">
              <button
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                className="w-8 h-9 flex items-center justify-center hover:bg-hueso-dim"
                aria-label="Reducir cantidad"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-mono">{cantidad}</span>
              <button
                onClick={() => setCantidad((c) => Math.min(producto.stock, c + 1))}
                className="w-8 h-9 flex items-center justify-center hover:bg-hueso-dim"
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAgregar}
              className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${
                agregado
                  ? "bg-pasto-700 text-hueso"
                  : "bg-pasto-950 text-hueso hover:bg-pasto-700"
              }`}
            >
              {agregado ? "Agregado ✓" : "Agregar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

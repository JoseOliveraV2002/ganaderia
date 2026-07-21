"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { useCarrito } from "@/components/CarritoContext";

export default function CarritoPage() {
  const { items, actualizarCantidad, quitar, total } = useCarrito();

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <h1 className="text-2xl font-semibold mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
          Tu carrito
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-carbon/20 rounded-xl">
            <p className="text-carbon/50 mb-4">Tu carrito está vacío.</p>
            <Link href="/" className="text-cuero font-medium underline">
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.productoId}
                  className="bg-white rounded-xl border border-pasto-900/10 p-4 flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.nombre}</p>
                    <p className="text-xs text-carbon/50 font-mono">
                      S/ {item.precioUnitario.toFixed(2)} / {item.unidad}
                    </p>
                  </div>
                  <div className="flex items-center border border-carbon/15 rounded-lg shrink-0">
                    <button
                      onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                      className="w-8 h-9 flex items-center justify-center hover:bg-hueso-dim"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-mono">{item.cantidad}</span>
                    <button
                      onClick={() =>
                        actualizarCantidad(
                          item.productoId,
                          Math.min(item.stockDisponible, item.cantidad + 1)
                        )
                      }
                      className="w-8 h-9 flex items-center justify-center hover:bg-hueso-dim"
                    >
                      +
                    </button>
                  </div>
                  <p className="w-20 text-right font-mono font-medium shrink-0">
                    S/ {(item.precioUnitario * item.cantidad).toFixed(2)}
                  </p>
                  <button
                    onClick={() => quitar(item.productoId)}
                    className="text-carbon/30 hover:text-cuero shrink-0"
                    aria-label="Quitar producto"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-pasto-950 text-hueso rounded-xl p-5 flex items-center justify-between">
              <span className="text-sm text-hueso/70">Total</span>
              <span className="text-2xl font-mono font-semibold">S/ {total.toFixed(2)}</span>
            </div>

            <Link
              href="/checkout"
              className="mt-4 block text-center bg-cuero hover:bg-cuero-light text-hueso font-medium rounded-xl py-3.5 transition-colors"
            >
              Continuar al pago
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

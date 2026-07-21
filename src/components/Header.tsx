"use client";

import Link from "next/link";
import { useCarrito } from "./CarritoContext";

export default function Header() {
  const { cantidadTotal } = useCarrito();

  return (
    <header className="bg-pasto-950 text-hueso sticky top-0 z-40 border-b border-pasto-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span
            className="text-xl sm:text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Asociación Ganadera
          </span>
          <span className="hidden sm:inline text-xs uppercase tracking-[0.2em] text-trigo">
            Lácteos · Carnes
          </span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6 text-sm">
          <Link href="/" className="hover:text-trigo transition-colors">
            Catálogo
          </Link>
          <Link href="/admin/login" className="hover:text-trigo transition-colors hidden sm:inline">
            Panel productor
          </Link>
          <Link
            href="/carrito"
            className="relative flex items-center gap-1.5 bg-cuero hover:bg-cuero-light transition-colors rounded-full px-3.5 py-1.5 font-medium"
          >
            Carrito
            {cantidadTotal > 0 && (
              <span className="bg-trigo text-carbon text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cantidadTotal}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

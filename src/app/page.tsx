"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ProductoCard from "@/components/ProductoCard";
import { Producto } from "@/lib/types";

const ORIGENES = ["Todos", "Vacuno", "Ovino", "Caprino"] as const;
const TIPOS = ["Todos", "Lacteo", "Carne"] as const;

export default function CatalogoPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [origen, setOrigen] = useState<(typeof ORIGENES)[number]>("Todos");
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]>("Todos");

  useEffect(() => {
    const params = new URLSearchParams();
    if (origen !== "Todos") params.set("origen", origen);
    if (tipo !== "Todos") params.set("tipo", tipo);
    setCargando(true);
    fetch(`/api/productos?${params.toString()}`)
      .then((r) => r.json())
      .then(setProductos)
      .finally(() => setCargando(false));
  }, [origen, tipo]);

  const enLiquidacion = productos.filter((p) => p.descuentoActivo);

  return (
    <div className="flex-1 flex flex-col">
      <Header />

      <section className="bg-pasto-950 text-hueso">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <p className="text-trigo text-xs uppercase tracking-[0.25em] mb-3">
            Directo del campo a tu mesa
          </p>
          <h1
            className="text-3xl sm:text-5xl font-semibold max-w-xl leading-[1.05]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Lácteos y carnes de nuestros productores asociados
          </h1>
          <p className="mt-4 text-hueso/70 max-w-md text-sm sm:text-base">
            Cada producto muestra su fecha de vencimiento real. Cuando está por vencer,
            el precio baja automáticamente — sin intermediarios, sin desperdicio.
          </p>
        </div>
      </section>

      {enLiquidacion.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 w-full">
          <div className="bg-cuero/10 border border-cuero/30 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="tag-liquidacion bg-cuero text-hueso text-xs font-bold uppercase px-2.5 py-1 rounded shrink-0">
              Liquidación
            </span>
            <p className="text-sm text-cuero-light">
              {enLiquidacion.length} producto{enLiquidacion.length !== 1 ? "s" : ""} con descuento
              automático por cercanía de vencimiento.
            </p>
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-carbon/50 self-center mr-1">Origen:</span>
            {ORIGENES.map((o) => (
              <button
                key={o}
                onClick={() => setOrigen(o)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  origen === o
                    ? "bg-pasto-950 text-hueso border-pasto-950"
                    : "border-carbon/15 text-carbon/70 hover:border-pasto-950"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-carbon/50 self-center mr-1">Tipo:</span>
            {TIPOS.map((t) => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  tipo === t
                    ? "bg-cuero text-hueso border-cuero"
                    : "border-carbon/15 text-carbon/70 hover:border-cuero"
                }`}
              >
                {t === "Lacteo" ? "Lácteos" : t === "Carne" ? "Carnes" : t}
              </button>
            ))}
          </div>
        </div>

        {cargando ? (
          <p className="text-center text-carbon/50 py-16">Cargando catálogo...</p>
        ) : productos.length === 0 ? (
          <p className="text-center text-carbon/50 py-16">
            No hay productos con estos filtros.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productos.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-carbon/10 py-6 text-center text-xs text-carbon/40">
        Asociación de Productores Cárnicos y Lácteos — Tienda en línea
      </footer>
    </div>
  );
}

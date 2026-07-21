"use client";

import { useEffect, useState } from "react";
import { Pedido } from "@/lib/types";

const ESTADOS = ["Pendiente", "En Preparacion", "Listo", "Entregado"] as const;

const ESTADO_COLOR: Record<string, string> = {
  Pendiente: "bg-trigo/30 text-carbon",
  "En Preparacion": "bg-pasto-700/20 text-pasto-950",
  Listo: "bg-pasto-950 text-hueso",
  Entregado: "bg-carbon/10 text-carbon/50",
};

export default function PedidosPanelClient() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    setCargando(true);
    const res = await fetch("/api/pedidos");
    if (res.ok) setPedidos(await res.json());
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function cambiarEstado(itemId: number, estado: string) {
    await fetch(`/api/pedido-items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    cargar();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
      <h1 className="text-2xl font-semibold mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
        Pedidos
      </h1>

      {cargando ? (
        <p className="text-center text-carbon/50 py-10">Cargando...</p>
      ) : pedidos.length === 0 ? (
        <p className="text-center text-carbon/40 py-10">
          Aún no hay pedidos con tus productos.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-white border border-pasto-900/10 rounded-xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-carbon/10">
                <div>
                  <p className="font-medium">
                    Pedido #{pedido.id} — {pedido.clienteNombre}
                  </p>
                  <p className="text-xs text-carbon/50">
                    {pedido.clienteContacto} ·{" "}
                    {pedido.tipoEntrega === "recojo" ? "Recojo en planta" : `Envío a ${pedido.direccion}`}{" "}
                    · {pedido.metodoPago === "culqi_tarjeta" ? "Tarjeta" : "Contra entrega"}
                  </p>
                </div>
                <span className="text-xs text-carbon/40">
                  {new Date(pedido.creadoEn).toLocaleString("es-PE")}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {pedido.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                  >
                    <span>
                      {item.cantidad}× {item.nombreProducto}{" "}
                      <span className="text-carbon/40 font-mono">
                        (S/ {(item.precioUnitario * item.cantidad).toFixed(2)})
                      </span>
                    </span>
                    <select
                      value={item.estado}
                      onChange={(e) => cambiarEstado(item.id, e.target.value)}
                      className={`text-xs rounded-full px-3 py-1 font-medium border-none ${ESTADO_COLOR[item.estado]}`}
                    >
                      {ESTADOS.map((e) => (
                        <option key={e} value={e}>
                          {e === "En Preparacion" ? "En Preparación" : e}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

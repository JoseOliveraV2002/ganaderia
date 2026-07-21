"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useCarrito } from "@/components/CarritoContext";

export default function CheckoutPage() {
  const { items, total, vaciar } = useCarrito();
  const router = useRouter();

  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteContacto, setClienteContacto] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState<"recojo" | "domicilio">("recojo");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState<"culqi_tarjeta" | "contra_entrega">(
    "contra_entrega"
  );
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmarPedido() {
    setError(null);
    if (!clienteNombre.trim() || !clienteContacto.trim()) {
      setError("Completa tu nombre y un contacto (teléfono o WhatsApp).");
      return;
    }
    if (tipoEntrega === "domicilio" && !direccion.trim()) {
      setError("Ingresa la dirección de envío.");
      return;
    }
    if (items.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteNombre,
          clienteContacto,
          tipoEntrega,
          direccion: tipoEntrega === "domicilio" ? direccion : undefined,
          metodoPago,
          items: items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo procesar el pedido.");
        setEnviando(false);
        return;
      }
      vaciar();
      router.push(`/checkout/confirmacion?pedido=${data.id}&pago=${metodoPago}`);
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
      setEnviando(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <h1 className="text-2xl font-semibold mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
          Finalizar compra
        </h1>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-pasto-900/10 p-5">
            <h2 className="font-medium mb-3 text-sm uppercase tracking-wide text-carbon/50">
              Tus datos
            </h2>
            <div className="flex flex-col gap-3">
              <input
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                placeholder="Nombre completo"
                className="border border-carbon/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pasto-700"
              />
              <input
                value={clienteContacto}
                onChange={(e) => setClienteContacto(e.target.value)}
                placeholder="Teléfono / WhatsApp"
                className="border border-carbon/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pasto-700"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-pasto-900/10 p-5">
            <h2 className="font-medium mb-3 text-sm uppercase tracking-wide text-carbon/50">
              Entrega
            </h2>
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setTipoEntrega("recojo")}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  tipoEntrega === "recojo"
                    ? "border-pasto-950 bg-pasto-950 text-hueso"
                    : "border-carbon/15 text-carbon/70"
                }`}
              >
                Recojo en planta
              </button>
              <button
                onClick={() => setTipoEntrega("domicilio")}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  tipoEntrega === "domicilio"
                    ? "border-pasto-950 bg-pasto-950 text-hueso"
                    : "border-carbon/15 text-carbon/70"
                }`}
              >
                Envío a domicilio
              </button>
            </div>
            {tipoEntrega === "domicilio" && (
              <textarea
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Dirección completa de envío"
                rows={2}
                className="w-full border border-carbon/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pasto-700"
              />
            )}
          </div>

          <div className="bg-white rounded-xl border border-pasto-900/10 p-5">
            <h2 className="font-medium mb-3 text-sm uppercase tracking-wide text-carbon/50">
              Método de pago
            </h2>
            <div className="flex flex-col gap-2">
              <label
                className={`flex items-center gap-3 border rounded-lg px-3 py-2.5 cursor-pointer ${
                  metodoPago === "culqi_tarjeta" ? "border-pasto-950" : "border-carbon/15"
                }`}
              >
                <input
                  type="radio"
                  checked={metodoPago === "culqi_tarjeta"}
                  onChange={() => setMetodoPago("culqi_tarjeta")}
                />
                <span className="text-sm">Tarjeta de crédito / débito (Culqi)</span>
              </label>
              <label
                className={`flex items-center gap-3 border rounded-lg px-3 py-2.5 cursor-pointer ${
                  metodoPago === "contra_entrega" ? "border-pasto-950" : "border-carbon/15"
                }`}
              >
                <input
                  type="radio"
                  checked={metodoPago === "contra_entrega"}
                  onChange={() => setMetodoPago("contra_entrega")}
                />
                <span className="text-sm">Pago contra entrega / Transferencia</span>
              </label>
            </div>
            {metodoPago === "culqi_tarjeta" && (
              <p className="mt-3 text-xs text-carbon/50 bg-hueso-dim rounded-lg px-3 py-2">
                Nota de desarrollo: el formulario de tarjeta de Culqi (Checkout.js) se conecta aquí
                una vez tengamos las llaves de prueba. Por ahora este método simula el flujo y crea
                el pedido igual que "contra entrega".
              </p>
            )}
          </div>

          <div className="bg-pasto-950 text-hueso rounded-xl p-5 flex items-center justify-between">
            <span className="text-sm text-hueso/70">Total a pagar</span>
            <span className="text-2xl font-mono font-semibold">S/ {total.toFixed(2)}</span>
          </div>

          {error && (
            <p className="text-cuero text-sm bg-cuero/10 border border-cuero/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={confirmarPedido}
            disabled={enviando}
            className="bg-cuero hover:bg-cuero-light disabled:opacity-50 text-hueso font-medium rounded-xl py-3.5 transition-colors"
          >
            {enviando ? "Procesando..." : "Confirmar pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}

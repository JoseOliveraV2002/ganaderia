"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { Suspense } from "react";

function Contenido() {
  const params = useSearchParams();
  const pedido = params.get("pedido");
  const pago = params.get("pago");

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 w-full flex-1 text-center">
      <div className="w-16 h-16 rounded-full bg-pasto-950 text-hueso flex items-center justify-center text-2xl mx-auto mb-6">
        ✓
      </div>
      <h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
        ¡Pedido confirmado!
      </h1>
      <p className="text-carbon/60 mb-6">
        Tu pedido <span className="font-mono font-medium">#{pedido}</span> fue registrado
        correctamente.
      </p>

      {pago === "contra_entrega" && (
        <div className="bg-white border border-pasto-900/10 rounded-xl p-5 text-left text-sm mb-6">
          <p className="font-medium mb-2">Instrucciones de pago:</p>
          <p className="text-carbon/70">
            Coordina el pago contra entrega directamente con el productor, o realiza una
            transferencia y envía el comprobante por WhatsApp al número de la asociación.
          </p>
        </div>
      )}

      <Link href="/" className="text-cuero font-medium underline">
        Volver al catálogo
      </Link>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <Suspense fallback={null}>
        <Contenido />
      </Suspense>
    </div>
  );
}

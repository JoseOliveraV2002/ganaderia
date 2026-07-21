import { NextResponse } from "next/server";
import { aplicarDescuentosAutomaticos } from "@/lib/descuentos";

// En producción (EC2), un crontab llama a este endpoint cada hora:
// 0 * * * * curl -X POST http://localhost:3000/api/cron/descuentos
export async function POST() {
  const resultados = await aplicarDescuentosAutomaticos();
  return NextResponse.json({
    ejecutadoEn: new Date().toISOString(),
    cambios: resultados.length,
    detalle: resultados,
  });
}

export async function GET() {
  const resultados = await aplicarDescuentosAutomaticos();
  return NextResponse.json({
    ejecutadoEn: new Date().toISOString(),
    cambios: resultados.length,
    detalle: resultados,
  });
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al iniciar sesión");
      setCargando(false);
      return;
    }
    router.push("/admin/pedidos");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pasto-950 px-4">
      <div className="bg-hueso rounded-2xl p-8 w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-cuero mb-1">Asociación Ganadera</p>
        <h1 className="text-2xl font-semibold mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
          Panel del productor
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo"
            className="border border-carbon/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pasto-700"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="border border-carbon/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pasto-700"
          />
          {error && <p className="text-cuero text-sm">{error}</p>}
          <button
            type="submit"
            disabled={cargando}
            className="bg-pasto-950 hover:bg-pasto-700 disabled:opacity-50 text-hueso font-medium rounded-lg py-2.5 mt-2 transition-colors"
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        <div className="mt-6 text-xs text-carbon/40 border-t border-carbon/10 pt-4">
          <p className="font-medium mb-1">Usuarios de prueba (datos de seed):</p>
          <p>quispe@asociacion.pe / lacteos123</p>
          <p>mamani@asociacion.pe / carnes123</p>
          <p>admin@asociacion.pe / admin123 (superadmin)</p>
        </div>
        <Link href="/" className="block mt-4 text-center text-sm text-carbon/50 underline">
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}

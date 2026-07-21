"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminHeader({
  nombre,
  rol,
}: {
  nombre: string;
  rol: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const tabs = [
    { href: "/admin/pedidos", label: "Pedidos" },
    { href: "/admin/productos", label: "Mis productos" },
  ];

  return (
    <header className="bg-pasto-950 text-hueso">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{nombre}</p>
          <p className="text-[11px] text-hueso/50 uppercase tracking-wide">
            {rol === "superadmin" ? "Superadmin" : "Productor"}
          </p>
        </div>
        <nav className="flex items-center gap-1 bg-pasto-900/60 rounded-full p-1">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`text-xs sm:text-sm px-3 sm:px-4 py-1.5 rounded-full transition-colors ${
                pathname === t.href ? "bg-trigo text-carbon font-medium" : "text-hueso/70"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="text-xs sm:text-sm text-hueso/60 hover:text-cuero-light"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

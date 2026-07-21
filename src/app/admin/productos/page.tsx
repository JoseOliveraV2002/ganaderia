import { redirect } from "next/navigation";
import { getSesion } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";
import ProductosPanelClient from "./ProductosPanelClient";

export default async function ProductosAdminPage() {
  const sesion = await getSesion();
  if (!sesion) redirect("/admin/login");

  return (
    <div className="min-h-screen flex flex-col bg-hueso">
      <AdminHeader nombre={sesion.nombre} rol={sesion.rol} />
      <ProductosPanelClient />
    </div>
  );
}

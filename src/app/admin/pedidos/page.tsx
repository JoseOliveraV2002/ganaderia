import { redirect } from "next/navigation";
import { getSesion } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";
import PedidosPanelClient from "./PedidosPanelClient";

export default async function PedidosAdminPage() {
  const sesion = await getSesion();
  if (!sesion) redirect("/admin/login");

  return (
    <div className="min-h-screen flex flex-col bg-hueso">
      <AdminHeader nombre={sesion.nombre} rol={sesion.rol} />
      <PedidosPanelClient />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Producto } from "@/lib/types";

const CATEGORIAS = ["Vacuno", "Ovino", "Caprino"] as const;
const TIPOS = ["Lacteo", "Carne"] as const;

interface FormState {
  id?: number;
  nombre: string;
  categoriaOrigen: (typeof CATEGORIAS)[number];
  tipo: (typeof TIPOS)[number];
  precio: string;
  stock: string;
  unidad: string;
  fechaVencimiento: string;
  fotoUrl: string;
}

const formVacio: FormState = {
  nombre: "",
  categoriaOrigen: "Vacuno",
  tipo: "Lacteo",
  precio: "",
  stock: "",
  unidad: "kg",
  fechaVencimiento: "",
  fotoUrl: "",
};

export default function ProductosPanelClient() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState<FormState>(formVacio);
  const [editando, setEditando] = useState(false);
  const [mensajeCron, setMensajeCron] = useState<string | null>(null);
  const [ejecutandoCron, setEjecutandoCron] = useState(false);

  async function cargar() {
    setCargando(true);
    const res = await fetch("/api/productos?mios=1");
    if (res.ok) setProductos(await res.json());
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  function editar(p: Producto) {
    setForm({
      id: p.id,
      nombre: p.nombre,
      categoriaOrigen: p.categoriaOrigen,
      tipo: p.tipo,
      precio: String(p.precio),
      stock: String(p.stock),
      unidad: p.unidad,
      fechaVencimiento: p.fechaVencimiento,
      fotoUrl: p.fotoUrl || "",
    });
    setEditando(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelar() {
    setForm(formVacio);
    setEditando(false);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      nombre: form.nombre,
      categoriaOrigen: form.categoriaOrigen,
      tipo: form.tipo,
      precio: Number(form.precio),
      stock: Number(form.stock),
      unidad: form.unidad,
      fechaVencimiento: form.fechaVencimiento,
      fotoUrl: form.fotoUrl || undefined,
    };

    const url = form.id ? `/api/productos/${form.id}` : "/api/productos";
    const method = form.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      cancelar();
      cargar();
    }
  }

  async function borrar(id: number) {
    if (!confirm("¿Eliminar este producto?")) return;
    await fetch(`/api/productos/${id}`, { method: "DELETE" });
    cargar();
  }

  async function ejecutarCron() {
    setEjecutandoCron(true);
    setMensajeCron(null);
    const res = await fetch("/api/cron/descuentos", { method: "POST" });
    const data = await res.json();
    setMensajeCron(
      data.cambios > 0
        ? `${data.cambios} producto(s) actualizados por la regla de vencimiento.`
        : "Sin cambios: ningún producto cumple la regla en este momento."
    );
    setEjecutandoCron(false);
    cargar();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>
          Mis productos
        </h1>
        <button
          onClick={ejecutarCron}
          disabled={ejecutandoCron}
          className="text-sm bg-cuero hover:bg-cuero-light disabled:opacity-50 text-hueso rounded-lg px-4 py-2 font-medium"
        >
          {ejecutandoCron ? "Ejecutando..." : "▶ Simular revisión automática (cron)"}
        </button>
      </div>

      {mensajeCron && (
        <p className="text-sm bg-trigo/20 border border-trigo/40 rounded-lg px-4 py-2.5 mb-6">
          {mensajeCron}
        </p>
      )}

      <form
        onSubmit={guardar}
        className="bg-white border border-pasto-900/10 rounded-xl p-5 mb-8 grid grid-cols-2 sm:grid-cols-3 gap-3"
      >
        <input
          required
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          placeholder="Nombre del producto"
          className="col-span-2 sm:col-span-3 border border-carbon/15 rounded-lg px-3 py-2 text-sm"
        />
        <select
          value={form.categoriaOrigen}
          onChange={(e) =>
            setForm({ ...form, categoriaOrigen: e.target.value as FormState["categoriaOrigen"] })
          }
          className="border border-carbon/15 rounded-lg px-3 py-2 text-sm"
        >
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value as FormState["tipo"] })}
          className="border border-carbon/15 rounded-lg px-3 py-2 text-sm"
        >
          <option value="Lacteo">Lácteo</option>
          <option value="Carne">Carne</option>
        </select>
        <select
          value={form.unidad}
          onChange={(e) => setForm({ ...form, unidad: e.target.value })}
          className="border border-carbon/15 rounded-lg px-3 py-2 text-sm"
        >
          <option value="kg">kg</option>
          <option value="litro">litro</option>
        </select>
        <input
          required
          type="number"
          step="0.01"
          value={form.precio}
          onChange={(e) => setForm({ ...form, precio: e.target.value })}
          placeholder="Precio (S/)"
          className="border border-carbon/15 rounded-lg px-3 py-2 text-sm"
        />
        <input
          required
          type="number"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          placeholder="Stock"
          className="border border-carbon/15 rounded-lg px-3 py-2 text-sm"
        />
        <input
          required
          type="date"
          value={form.fechaVencimiento}
          onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })}
          className="border border-carbon/15 rounded-lg px-3 py-2 text-sm"
        />
        <input
          value={form.fotoUrl}
          onChange={(e) => setForm({ ...form, fotoUrl: e.target.value })}
          placeholder="URL de foto (opcional)"
          className="col-span-2 sm:col-span-3 border border-carbon/15 rounded-lg px-3 py-2 text-sm"
        />
        <div className="col-span-2 sm:col-span-3 flex gap-2">
          <button
            type="submit"
            className="bg-pasto-950 hover:bg-pasto-700 text-hueso rounded-lg px-4 py-2 text-sm font-medium"
          >
            {editando ? "Guardar cambios" : "Agregar producto"}
          </button>
          {editando && (
            <button
              type="button"
              onClick={cancelar}
              className="text-sm text-carbon/50 px-4 py-2"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {cargando ? (
        <p className="text-center text-carbon/50 py-10">Cargando...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {productos.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-pasto-900/10 rounded-xl p-4 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium">{p.nombre}</p>
                <p className="text-xs text-carbon/50">
                  {p.categoriaOrigen} · {p.tipo === "Lacteo" ? "Lácteo" : "Carne"} · Vence{" "}
                  {p.fechaVencimiento} · {p.stock} {p.unidad}
                  {p.stock !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="font-mono text-sm shrink-0">
                {p.descuentoActivo && (
                  <span className="text-cuero font-medium mr-1">-{p.porcentajeDescuento}%</span>
                )}
                S/ {p.precioFinal.toFixed(2)}
              </div>
              <button
                onClick={() => editar(p)}
                className="text-sm text-pasto-700 underline shrink-0"
              >
                Editar
              </button>
              <button
                onClick={() => borrar(p.id)}
                className="text-sm text-cuero underline shrink-0"
              >
                Borrar
              </button>
            </div>
          ))}
          {productos.length === 0 && (
            <p className="text-center text-carbon/40 py-10">Aún no tienes productos.</p>
          )}
        </div>
      )}
    </div>
  );
}

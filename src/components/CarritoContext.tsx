"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface ItemCarrito {
  productoId: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  stockDisponible: number;
  unidad: string;
  fotoUrl?: string | null;
}

interface CarritoContextType {
  items: ItemCarrito[];
  agregar: (item: Omit<ItemCarrito, "cantidad">, cantidad?: number) => void;
  actualizarCantidad: (productoId: number, cantidad: number) => void;
  quitar: (productoId: number) => void;
  vaciar: () => void;
  total: number;
  cantidadTotal: number;
}

const CarritoContext = createContext<CarritoContextType | null>(null);

const STORAGE_KEY = "ganadera_carrito";

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) setItems(JSON.parse(guardado));
    } catch {
      // ignora datos corruptos
    }
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, cargado]);

  function agregar(item: Omit<ItemCarrito, "cantidad">, cantidad = 1) {
    setItems((prev) => {
      const existe = prev.find((i) => i.productoId === item.productoId);
      if (existe) {
        const nuevaCantidad = Math.min(existe.cantidad + cantidad, item.stockDisponible);
        return prev.map((i) =>
          i.productoId === item.productoId ? { ...i, cantidad: nuevaCantidad } : i
        );
      }
      return [...prev, { ...item, cantidad: Math.min(cantidad, item.stockDisponible) }];
    });
  }

  function actualizarCantidad(productoId: number, cantidad: number) {
    setItems((prev) =>
      prev
        .map((i) => (i.productoId === productoId ? { ...i, cantidad } : i))
        .filter((i) => i.cantidad > 0)
    );
  }

  function quitar(productoId: number) {
    setItems((prev) => prev.filter((i) => i.productoId !== productoId));
  }

  function vaciar() {
    setItems([]);
  }

  const total = items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0);
  const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);

  return (
    <CarritoContext.Provider
      value={{ items, agregar, actualizarCantidad, quitar, vaciar, total, cantidadTotal }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de CarritoProvider");
  return ctx;
}

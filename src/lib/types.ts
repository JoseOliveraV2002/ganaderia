export interface Producto {
  id: number;
  productorId: number;
  nombre: string;
  categoriaOrigen: "Vacuno" | "Ovino" | "Caprino";
  tipo: "Lacteo" | "Carne";
  precio: number;
  precioFinal: number;
  stock: number;
  unidad: string;
  fechaVencimiento: string;
  fotoUrl: string | null;
  descuentoActivo: boolean;
  porcentajeDescuento: number;
  productorNombre?: string | null;
}

export interface LineaPedido {
  id: number;
  pedidoId: number;
  productoId: number;
  productorId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  estado: "Pendiente" | "En Preparacion" | "Listo" | "Entregado";
}

export interface Pedido {
  id: number;
  clienteNombre: string;
  clienteContacto: string;
  tipoEntrega: "recojo" | "domicilio";
  direccion: string | null;
  metodoPago: "culqi_tarjeta" | "contra_entrega";
  total: number;
  creadoEn: string;
  items: LineaPedido[];
}

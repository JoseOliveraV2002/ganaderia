import { pgTable, serial, text, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";

// Productores: cada uno gestiona SOLO sus propios productos
export const productores = pgTable("productores", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  telefono: text("telefono"),
  rol: text("rol", { enum: ["productor", "superadmin"] })
    .notNull()
    .default("productor"),
  creadoEn: timestamp("creado_en").defaultNow(),
});

export const productos = pgTable("productos", {
  id: serial("id").primaryKey(),
  productorId: integer("productor_id")
    .notNull()
    .references(() => productores.id),
  nombre: text("nombre").notNull(),
  categoriaOrigen: text("categoria_origen", {
    enum: ["Vacuno", "Ovino", "Caprino"],
  }).notNull(),
  tipo: text("tipo", { enum: ["Lacteo", "Carne"] }).notNull(),
  precio: real("precio").notNull(),
  precioFinal: real("precio_final").notNull(),
  stock: integer("stock").notNull().default(0),
  unidad: text("unidad").notNull().default("kg"),
  fechaVencimiento: text("fecha_vencimiento").notNull(),
  fotoUrl: text("foto_url"),
  descuentoActivo: boolean("descuento_activo").notNull().default(false),
  porcentajeDescuento: integer("porcentaje_descuento").notNull().default(0),
  creadoEn: timestamp("creado_en").defaultNow(),
});

// Regla de descuento configurable por producto/categoría (RF-02)
export const reglasDescuento = pgTable("reglas_descuento", {
  id: serial("id").primaryKey(),
  productorId: integer("productor_id")
    .notNull()
    .references(() => productores.id),
  tipoAplica: text("tipo_aplica", { enum: ["Lacteo", "Carne", "Todos"] })
    .notNull()
    .default("Todos"),
  diasParaVencer: integer("dias_para_vencer").notNull().default(3),
  porcentajeDescuento: integer("porcentaje_descuento").notNull().default(30),
  activa: boolean("activa").notNull().default(true),
});

export const pedidos = pgTable("pedidos", {
  id: serial("id").primaryKey(),
  clienteNombre: text("cliente_nombre").notNull(),
  clienteContacto: text("cliente_contacto").notNull(),
  tipoEntrega: text("tipo_entrega", {
    enum: ["recojo", "domicilio"],
  }).notNull(),
  direccion: text("direccion"),
  metodoPago: text("metodo_pago", {
    enum: ["culqi_tarjeta", "contra_entrega"],
  }).notNull(),
  total: real("total").notNull(),
  creadoEn: timestamp("creado_en").defaultNow(),
});

// Cada línea de pedido guarda a qué productor pertenece, y su propio estado,
// para que cada productor solo vea y actualice SUS líneas dentro de un pedido compartido.
export const pedidoItems = pgTable("pedido_items", {
  id: serial("id").primaryKey(),
  pedidoId: integer("pedido_id")
    .notNull()
    .references(() => pedidos.id),
  productoId: integer("producto_id")
    .notNull()
    .references(() => productos.id),
  productorId: integer("productor_id")
    .notNull()
    .references(() => productores.id),
  nombreProducto: text("nombre_producto").notNull(),
  cantidad: integer("cantidad").notNull(),
  precioUnitario: real("precio_unitario").notNull(),
  estado: text("estado", {
    enum: ["Pendiente", "En Preparacion", "Listo", "Entregado"],
  })
    .notNull()
    .default("Pendiente"),
});

import { neon } from "@neondatabase/serverless";
import { db } from "./index";
import { productores, productos, reglasDescuento } from "./schema";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

function diasDesdeHoy(dias: number) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().split("T")[0];
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Falta DATABASE_URL en tu .env (connection string de Neon).");
  }
  const sql = neon(process.env.DATABASE_URL);

  console.log("Creando tablas...");
  const migracion = fs.readFileSync(path.join(process.cwd(), "src/db/migrate.sql"), "utf-8");
  // neon-http no soporta multi-statement en una sola llamada: se ejecuta sentencia por sentencia
  const sentencias = migracion.split(";").map((s) => s.trim()).filter(Boolean);
  for (const s of sentencias) {
    await sql.query(s);
  }

  console.log("Limpiando datos previos...");
  await sql.query("DELETE FROM pedido_items");
  await sql.query("DELETE FROM pedidos");
  await sql.query("DELETE FROM reglas_descuento");
  await sql.query("DELETE FROM productos");
  await sql.query("DELETE FROM productores");

  console.log("Creando productores...");
  const pass1 = await bcrypt.hash("lacteos123", 10);
  const pass2 = await bcrypt.hash("carnes123", 10);
  const passAdmin = await bcrypt.hash("admin123", 10);

  const [prod1] = await db
    .insert(productores)
    .values({
      nombre: "Familia Quispe (Lácteos)",
      email: "quispe@asociacion.pe",
      passwordHash: pass1,
      telefono: "987654321",
      rol: "productor",
    })
    .returning();

  const [prod2] = await db
    .insert(productores)
    .values({
      nombre: "Familia Mamani (Carnes)",
      email: "mamani@asociacion.pe",
      passwordHash: pass2,
      telefono: "987123456",
      rol: "productor",
    })
    .returning();

  await db.insert(productores).values({
    nombre: "Administrador Asociación",
    email: "admin@asociacion.pe",
    passwordHash: passAdmin,
    telefono: "987000000",
    rol: "superadmin",
  });

  console.log("Creando reglas de descuento...");
  await db.insert(reglasDescuento).values([
    {
      productorId: prod1.id,
      tipoAplica: "Lacteo",
      diasParaVencer: 3,
      porcentajeDescuento: 30,
      activa: true,
    },
    {
      productorId: prod2.id,
      tipoAplica: "Carne",
      diasParaVencer: 2,
      porcentajeDescuento: 25,
      activa: true,
    },
  ]);

  console.log("Creando productos...");
  await db.insert(productos).values([
    {
      productorId: prod1.id,
      nombre: "Queso fresco Vacuno",
      categoriaOrigen: "Vacuno",
      tipo: "Lacteo",
      precio: 18,
      precioFinal: 18,
      stock: 25,
      unidad: "kg",
      fechaVencimiento: diasDesdeHoy(2),
      fotoUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400",
    },
    {
      productorId: prod1.id,
      nombre: "Yogur natural Vacuno",
      categoriaOrigen: "Vacuno",
      tipo: "Lacteo",
      precio: 12,
      precioFinal: 12,
      stock: 40,
      unidad: "litro",
      fechaVencimiento: diasDesdeHoy(1),
      fotoUrl: "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400",
    },
    {
      productorId: prod1.id,
      nombre: "Queso de cabra",
      categoriaOrigen: "Caprino",
      tipo: "Lacteo",
      precio: 22,
      precioFinal: 22,
      stock: 15,
      unidad: "kg",
      fechaVencimiento: diasDesdeHoy(20),
      fotoUrl: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400",
    },
    {
      productorId: prod1.id,
      nombre: "Leche fresca Vacuno",
      categoriaOrigen: "Vacuno",
      tipo: "Lacteo",
      precio: 5.5,
      precioFinal: 5.5,
      stock: 60,
      unidad: "litro",
      fechaVencimiento: diasDesdeHoy(15),
      fotoUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
    },
    {
      productorId: prod2.id,
      nombre: "Carne de res (bistec)",
      categoriaOrigen: "Vacuno",
      tipo: "Carne",
      precio: 32,
      precioFinal: 32,
      stock: 18,
      unidad: "kg",
      fechaVencimiento: diasDesdeHoy(10),
      fotoUrl: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400",
    },
    {
      productorId: prod2.id,
      nombre: "Cordero (pierna)",
      categoriaOrigen: "Ovino",
      tipo: "Carne",
      precio: 38,
      precioFinal: 38,
      stock: 10,
      unidad: "kg",
      fechaVencimiento: diasDesdeHoy(1),
      fotoUrl: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400",
    },
    {
      productorId: prod2.id,
      nombre: "Cabrito entero",
      categoriaOrigen: "Caprino",
      tipo: "Carne",
      precio: 45,
      precioFinal: 45,
      stock: 6,
      unidad: "kg",
      fechaVencimiento: diasDesdeHoy(8),
      fotoUrl: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400",
    },
  ]);

  console.log("Listo. Usuarios de prueba:");
  console.log("  Productor Lácteos -> quispe@asociacion.pe / lacteos123");
  console.log("  Productor Carnes  -> mamani@asociacion.pe / carnes123");
  console.log("  Superadmin        -> admin@asociacion.pe / admin123");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

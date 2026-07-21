CREATE TABLE IF NOT EXISTS productores (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  telefono TEXT,
  rol TEXT NOT NULL DEFAULT 'productor',
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  productor_id INTEGER NOT NULL REFERENCES productores(id),
  nombre TEXT NOT NULL,
  categoria_origen TEXT NOT NULL,
  tipo TEXT NOT NULL,
  precio REAL NOT NULL,
  precio_final REAL NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  unidad TEXT NOT NULL DEFAULT 'kg',
  fecha_vencimiento TEXT NOT NULL,
  foto_url TEXT,
  descuento_activo BOOLEAN NOT NULL DEFAULT FALSE,
  porcentaje_descuento INTEGER NOT NULL DEFAULT 0,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reglas_descuento (
  id SERIAL PRIMARY KEY,
  productor_id INTEGER NOT NULL REFERENCES productores(id),
  tipo_aplica TEXT NOT NULL DEFAULT 'Todos',
  dias_para_vencer INTEGER NOT NULL DEFAULT 3,
  porcentaje_descuento INTEGER NOT NULL DEFAULT 30,
  activa BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  cliente_nombre TEXT NOT NULL,
  cliente_contacto TEXT NOT NULL,
  tipo_entrega TEXT NOT NULL,
  direccion TEXT,
  metodo_pago TEXT NOT NULL,
  total REAL NOT NULL,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedido_items (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
  producto_id INTEGER NOT NULL REFERENCES productos(id),
  productor_id INTEGER NOT NULL REFERENCES productores(id),
  nombre_producto TEXT NOT NULL,
  cantidad INTEGER NOT NULL,
  precio_unitario REAL NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Pendiente'
);

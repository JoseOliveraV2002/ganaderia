# MVP Ganadera — Tienda y Control de Stock

Tienda en línea para la Asociación de Productores Cárnicos y Lácteos. Construido en 10 días
como Producto Mínimo Viable (MVP), según el documento de requerimientos del proyecto.

## Stack técnico

- **Next.js 16** (App Router) + **TypeScript** — frontend y backend en un solo proyecto
- **Tailwind CSS 4** — estilos
- **Drizzle ORM** + **Postgres en Neon** (serverless, vía `@neondatabase/serverless`) — compatible con el modelo serverless de Netlify
- **bcryptjs** — hash de contraseñas
- Autenticación propia con cookies firmadas (HMAC), sin librerías externas de auth

## Requerimientos cubiertos

| Req | Descripción | Estado |
|---|---|---|
| RF-01 | Catálogo con filtros por origen y tipo | Listo |
| RF-02 | Descuento automático por vencimiento (motor + regla configurable) | Listo |
| RF-03 | Carrito y checkout (recojo / domicilio) | Listo |
| RF-04 | Pago con tarjeta (Culqi, pendiente de llaves) + contra entrega | Contra entrega funcional; Culqi con flujo simulado hasta tener llaves de prueba |
| RF-05 | Panel de pedidos e inventario, multi-productor (cada uno ve solo sus productos/pedidos) | Listo |
| RNF-01 | Responsive / mobile-first | Listo |
| RNF-02 | Carga ligera (imágenes servidas por URL, sin procesar localmente) | Listo |
| RNF-04 | HTTPS obligatorio, sin datos de tarjeta en servidor propio | Pendiente de configurar en el hosting final |

## Estructura relevante

```
src/
  db/
    schema.ts       # Modelo de datos (Drizzle)
    migrate.sql      # Creación de tablas
    seed.ts          # Datos de prueba (productores, productos, reglas)
    index.ts         # Cliente de base de datos
  lib/
    auth.ts          # Login/logout/sesión (cookies firmadas)
    descuentos.ts    # Motor de descuentos automáticos (RF-02)
    types.ts
  app/
    page.tsx                    # Catálogo público
    carrito/page.tsx
    checkout/page.tsx
    checkout/confirmacion/page.tsx
    admin/login/page.tsx
    admin/productos/            # CRUD de productos (scoped por productor)
    admin/pedidos/              # Gestión de pedidos (scoped por productor)
    api/                        # Endpoints REST
```

## Cómo correrlo localmente

Necesitas una base de datos Postgres. La más rápida de crear gratis es **Neon**:

1. Crea una cuenta en https://neon.tech (gratis).
2. Crea un proyecto nuevo.
3. Copia el "Connection string" que te dan (algo como
   `postgresql://usuario:password@ep-xxxx.aws.neon.tech/neondb?sslmode=require`).

Luego:

```bash
npm install
cp .env.example .env
# pega tu DATABASE_URL de Neon dentro de .env
npm run seed     # crea las tablas y carga datos de prueba
npm run dev      # http://localhost:3000
```

### Usuarios de prueba (creados por npm run seed)

| Rol | Email | Contraseña |
|---|---|---|
| Productor (Lácteos) | quispe@asociacion.pe | lacteos123 |
| Productor (Carnes) | mamani@asociacion.pe | carnes123 |
| Superadmin | admin@asociacion.pe | admin123 |

El panel de admin está en `/admin/login`. El catálogo público está en `/`.

### Probar el motor de descuentos (RF-02)

El seed crea productos con fechas de vencimiento cercanas a hoy a propósito. Desde el panel
de "Mis productos" hay un botón "Simular revisión automática (cron)" que ejecuta la misma
lógica que correrá por cron en producción. También se puede llamar directamente:

```bash
curl -X POST http://localhost:3000/api/cron/descuentos
```

En producción (Netlify no tiene cron nativo gratuito ilimitado), usa un servicio externo
gratuito como **cron-job.org** o **EasyCron** para llamar a esa misma URL cada hora, apuntando
a tu dominio real, ej: `https://tudominio.netlify.app/api/cron/descuentos`.

## Paso a paso: subir a Git y desplegar en Netlify

### 1. Crear la base de datos en Neon (si no lo hiciste arriba)
Ya la tienes de la sección anterior. Guarda el `DATABASE_URL` a mano, lo necesitarás en Netlify.

### 2. Descomprimir y subir el proyecto a GitHub

```bash
unzip ganadera-mvp.zip
cd ganadera-mvp

git init
git add .
git commit -m "MVP inicial: catalogo, carrito, checkout, panel admin multi-productor"
git branch -M main
```

Crea un repositorio vacío en GitHub (sin README, sin .gitignore — ya los trae el proyecto),
luego:

```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

### 3. Correr el seed contra tu base de Neon (una sola vez, antes de desplegar)

```bash
# con tu .env ya configurado con el DATABASE_URL de Neon
npm run seed
```

Esto crea las tablas y los usuarios/productos de prueba directamente en tu base de datos en
la nube — así el sitio ya tendrá datos apenas lo despliegues.

### 4. Conectar Netlify a tu repositorio

1. Entra a https://app.netlify.com → **Add new site → Import an existing project**.
2. Elige **GitHub** y autoriza el acceso, luego selecciona tu repositorio.
3. Netlify detecta Next.js automáticamente. Confirma:
   - **Build command:** `npm run build`
   - **Publish directory:** déjalo vacío/automático (el plugin de Next.js lo maneja)
4. **Antes de darle a "Deploy"**, ve a **Site settings → Environment variables** y agrega:
   - `DATABASE_URL` = tu connection string de Neon
   - `AUTH_SECRET` = un valor random (genera uno con `openssl rand -hex 32` en tu terminal)
5. Dale a **Deploy site**.

Netlify instalará automáticamente el plugin `@netlify/plugin-nextjs` (ya está declarado en
`netlify.toml`, incluido en el proyecto) para que las rutas API y el renderizado dinámico
funcionen correctamente como funciones serverless.

### 5. Verifica el despliegue
- Netlify te da una URL tipo `https://nombre-random.netlify.app`.
- Entra y confirma que el catálogo carga productos (si no, revisa que `DATABASE_URL` esté bien
  copiada en las variables de entorno).
- Prueba el login en `/admin/login` con los usuarios de prueba.
- Prueba `/api/cron/descuentos` para confirmar que el motor de descuentos funciona en vivo.

### 6. Dominio propio (opcional)
En **Site settings → Domain management → Add a domain**, sigue las instrucciones para apuntar
tu dominio comprado (Namecheap, GoDaddy, etc.) a Netlify. El certificado SSL (HTTPS) se activa
automáticamente y gratis (Let's Encrypt vía Netlify), cumpliendo RNF-04.

### 7. Despliegues futuros
Cualquier `git push` a la rama `main` vuelve a desplegar automáticamente. No necesitas volver
a correr `npm run seed` salvo que quieras resetear los datos de prueba.

## Variables de entorno

Ver `.env.example`. Se necesitan dos:
- `DATABASE_URL`: connection string de tu Postgres en Neon.
- `AUTH_SECRET`: usada para firmar las cookies de sesión del panel admin.

```bash
openssl rand -hex 32   # para generar un AUTH_SECRET seguro
```

## Pendientes conocidos (fuera del alcance del sprint de 10 días)

- Integración real de Culqi (checkout con tarjeta): el flujo está en la UI pero simula el pago
  hasta tener las llaves de prueba (pk_test_ / sk_test_).
- Compresión/optimización automática de imágenes subidas por el admin (por ahora se usan URLs
  externas; falta el flujo de subida de archivos).
- El cron de descuentos automáticos necesita un disparador externo en Netlify (ver sección de
  arriba); no corre "solo" sin ese llamado periódico.

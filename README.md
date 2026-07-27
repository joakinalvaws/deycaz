# DEYCAZ — tienda de perfumes y decants

Sitio de e-commerce para venta de decants de perfumes en Perú. Next.js (App
Router) + Supabase, pago contra entrega (por ahora — ver nota de pasarela de
pago más abajo). En producción: [deycaz.store](https://deycaz.store).

El diseño y flujo del sitio público replica el prototipo que llegó en
`design-reference/` (capturas de referencia visual + un mockup clickeable),
ajustado y corregido para funcionar como una app real con base de datos.

## 1. Crear el proyecto Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com) (o instala la
   integración de Supabase desde el Vercel Marketplace si vas a alojar en
   Vercel).
2. Abre el **SQL Editor** del proyecto y ejecuta, en este orden:
   - `supabase/schema.sql` — crea todas las tablas, RLS policies, buckets de
     Storage y funciones (`place_order`, `is_admin`) tal como quedan hoy.
     Este archivo ya refleja el estado final después de todas las
     migraciones — para un proyecto nuevo no hace falta correr nada de
     `supabase/migrations/` (esas son solo el historial incremental de cómo
     se llegó hasta acá, para ir aplicando en un proyecto que ya estaba
     corriendo una versión anterior).
   - `supabase/seed.sql` — carga las 6 categorías y 20 productos de ejemplo
     (los mismos del prototipo) para que el sitio no se vea vacío desde el
     primer momento. Reemplázalos con tu catálogo real desde el panel admin
     (ver más abajo) cuando quieras.
3. Crea tu usuario admin: registra un usuario en **Authentication → Users**
   del proyecto Supabase, después en el **SQL Editor** corre:
   ```sql
   insert into admin_users (id, email) values ('<uuid del usuario>', '<email>');
   ```
4. En **Project Settings → API**, copia `Project URL` y `anon public key`.

## 2. Variables de entorno

```bash
cp .env.local.example .env.local
```

Completa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` con los
valores del paso anterior. Si despliegas en Vercel, agrégalas también con
`vercel env add` (o desde el dashboard del proyecto). No hace falta (ni se
usa en ningún lado del código) la service role key — todo el acceso a
Supabase, público y admin por igual, pasa por RLS con la anon key.

## 3. Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para el sitio público, o
[http://localhost:3000/admin/login](http://localhost:3000/admin/login) para
el panel administrativo.

## Estructura

- `src/app/(site)/` — sitio público (App Router, grupo de rutas): inicio,
  `/catalogo`, `/categoria/[slug]`, `/producto/[id]`, `/promociones`,
  `/combo` (Arma tu Combo), `/contacto`. El checkout **no es una ruta**, es
  un modal (`CheckoutModal.tsx`) que vive sobre cualquier página del sitio.
- `src/app/admin/` — panel administrativo (`/admin`), protegido por
  `src/proxy.ts` (Next 16 renombró `middleware.ts` a esto). Gestión de
  productos (con precios por tamaño e imágenes), categorías (con foto de
  fondo), pedidos y clientes. Auth con Supabase Auth + tabla `admin_users`.
- `src/app/actions.ts` — Server Actions públicos: `placeOrder` (crea el
  pedido vía RPC `place_order`, con topes de cantidad/líneas — ver
  `MAX_QTY_PER_LINE`/`MAX_LINES_PER_ORDER`) y `submitContact`.
- `src/lib/data.ts` — lecturas del catálogo desde Supabase (Server
  Components, cliente anon).
- `src/lib/pricing.ts` — reglas de precio compartidas por tamaño (3/5/10ml,
  frasco entero). El cálculo que de verdad se cobra vive en la función
  `place_order` (Postgres) — el cliente solo la usa para *mostrar* precios.
- `src/lib/bundleDiscount.ts` — niveles de descuento de "Arma tu Combo" (ver
  sección de reglas de negocio abajo). Espejado a mano en `place_order`.
- `src/context/CartContext.tsx` — carrito en `localStorage` (no hay cuentas
  de usuario en el sitio público; es venta a invitados con pago contra
  entrega). Agregar un producto ya no abre el carrito automáticamente —
  la confirmación es un toast flotante.
- `src/modules/admin/` — todo el código del panel admin, organizado por
  feature (`products/categories/orders/customers/shared`).
- `supabase/schema.sql` — esquema completo y actualizado. `supabase/seed.sql`
  — datos de ejemplo. `supabase/migrations/` — historial incremental
  numerado (correr en orden solo si tu proyecto Supabase ya existía antes
  de una migración dada).
- `design-reference/` — el zip original y las capturas de referencia visual
  del prototipo; no se usan en el build, quedan solo como referencia.

## Reglas de negocio

- **Precio por tamaño**: cada producto tiene un precio base (5ml,
  obligatorio) y opcionalmente precios propios de 3ml/10ml/frasco entero.
  **No hay fórmula de respaldo** — si un tamaño no tiene precio cargado en
  el admin, simplemente no se ofrece ese tamaño para ese producto (ni en el
  selector del PDP ni en el checkout). Se eliminó a propósito un cálculo
  automático por porcentaje que existió al principio del proyecto porque
  daba precios poco atractivos.
- **"Arma tu Combo"**: precio plano por tamaño (3ml=S/.30, 5ml=S/.45,
  10ml=S/.75, el frasco entero no participa) igual para cualquier producto,
  con descuento por **niveles fijos en soles** según la cantidad total de
  decants de combo en el pedido (1→S/.0, 2→S/.10, 3→S/.20, 4→S/.35,
  5→S/.45, 6+→S/.50, nunca acumulables) — no es un porcentaje. El descuento
  se calcula una sola vez sobre el subtotal, nunca por unidad.
- El checkout pide nombre, celular, dirección de entrega y método de envío
  (Delivery Lima o Shalom Provincia, este último pide también DNI y
  agencia) antes de confirmar el pedido — el precio y el costo de envío se
  recalculan siempre en el servidor (`place_order`), nunca se confía en lo
  que llega del navegador.
- Confirmado el pedido, el flujo termina en un mensaje de WhatsApp
  pre-armado con el resumen — es el canal por el que se cierra la venta.

## Pendiente: pasarela de pago

Hoy el único método es pago contra entrega (`payment_method = 'cod'` en la
tabla `orders`, con `check` que solo permite ese valor). Cuando definan qué
pasarela usar (Culqi, Mercado Pago, Yape Empresas, etc.):

1. Agregar el nuevo valor al `check` de `orders.payment_method` en
   `supabase/schema.sql` (nueva migración numerada).
2. Añadir el flujo de pago dentro de `CheckoutModal.tsx`, antes de llamar a
   `placeOrder`.

El resto del flujo (carrito, combo, cálculo de precios) no necesita cambios.

## Deploy en Vercel

```bash
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel deploy --prod
```

Flujo de verificación antes de cada deploy: `npx tsc --noEmit` →
`npx eslint .` → `rm -rf .next && npm run build` → smoke test local
(`npx next start`) → commit → push → `vercel --prod`.

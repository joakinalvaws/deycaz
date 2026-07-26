# DEYCAZ — tienda de perfumes y decants

Sitio de e-commerce para venta de decants de perfumes en Perú. Next.js (App
Router) + Supabase, pago contra entrega (por ahora — ver nota de pasarela de
pago más abajo).

El diseño y flujo de este sitio replica el prototipo que llegó en
`design-reference/` (capturas de referencia visual + un mockup clickeable),
ajustado y corregido para funcionar como una app real con base de datos.

## 1. Crear el proyecto Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com) (o instala la
   integración de Supabase desde el Vercel Marketplace si vas a alojar en
   Vercel).
2. Abre el **SQL Editor** del proyecto y ejecuta, en este orden:
   - `supabase/schema.sql` — crea las tablas, RLS policies y la función
     `place_order`.
   - `supabase/seed.sql` — carga las 6 categorías, 20 productos de ejemplo y
     4 testimonios (los mismos del prototipo) para que el sitio no se vea
     vacío desde el primer momento. Reemplázalos cuando tengas tu catálogo
     real.
3. En **Project Settings → API**, copia `Project URL` y `anon public key`.

## 2. Variables de entorno

```bash
cp .env.local.example .env.local
```

Completa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` con los
valores del paso anterior. Si despliegas en Vercel, agrégalas también con
`vercel env add` (o desde el dashboard del proyecto).

## 3. Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura

- `src/app/` — páginas (App Router): inicio, `/catalogo`, `/categoria/[slug]`,
  `/producto/[id]`, `/promociones`, `/combo`, `/contacto`, `/checkout`,
  `/pedido-confirmado`.
- `src/app/actions.ts` — Server Actions: `placeOrder` (crea el pedido vía RPC
  `place_order`) y `submitContact`.
- `src/lib/data.ts` — lecturas del catálogo desde Supabase (Server Components).
- `src/lib/pricing.ts` — reglas de precio compartidas (tamaño 3/5/10ml,
  descuento de combo). El cálculo que de verdad se cobra vive en la función
  `place_order` (Postgres) — el cliente solo la usa para *mostrar* precios.
- `src/context/CartContext.tsx` — carrito en `localStorage` (no hay cuentas de
  usuario; es venta a invitados con pago contra entrega).
- `supabase/schema.sql` / `supabase/seed.sql` — esquema y datos de ejemplo.
- `design-reference/` — el zip original y las capturas de referencia visual
  que trajiste; no se usan en el build, quedan solo como referencia.

## Reglas de negocio (heredadas del prototipo, con una corrección)

- Precio por tamaño de un producto individual: 3ml = 70% del precio base,
  5ml = 100%, 10ml = 170% (redondeado).
- "Arma tu Combo": precio plano por tamaño (3ml=S/.30, 5ml=S/.45, 10ml=S/.75)
  igual para cualquier producto, con descuento del 10% desde 2 decants y 15%
  desde 4.
- **Corrección respecto al prototipo**: en el mockup original, el descuento
  de combo se mostraba en la vista previa pero no se aplicaba al carrito
  final (un bug de la maqueta). Aquí el descuento sí queda fijado en el
  precio de cada línea del combo y se respeta hasta el pago.
- El checkout ahora sí pide nombre, celular y dirección de entrega antes de
  confirmar el pedido — el prototipo original no pedía ningún dato de
  contacto/envío, algo necesario para poder cumplir un pedido contra entrega
  real.

## Pendiente: pasarela de pago

Hoy el único método es pago contra entrega (`payment_method = 'cod'` en la
tabla `orders`, con `check` que solo permite ese valor). Cuando definan qué
pasarela usar (Culqi, Mercado Pago, Yape Empresas, etc.):

1. Agregar el nuevo valor al `check` de `orders.payment_method` en
   `supabase/schema.sql`.
2. Añadir el flujo de pago antes de llamar a `placeOrder` en
   `src/app/checkout/page.tsx`.

El resto del flujo (carrito, combo, cálculo de precios) no necesita cambios.

## Pendiente: fotos de producto

Todos los productos usan un placeholder (`ProductImage`) hasta que subas
fotos reales. Súbelas a Supabase Storage y guarda la URL pública en
`products.image_url` — el frontend ya está listo para usarlas
(`next.config.ts` permite imágenes de `*.supabase.co`).

## Deploy en Vercel

```bash
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel deploy --prod
```

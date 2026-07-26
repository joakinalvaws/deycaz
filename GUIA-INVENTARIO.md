# Guía: cómo manejar el catálogo de DEYCAZ

Todo esto se hace desde el **Table Editor** de tu proyecto en
[supabase.com](https://supabase.com) — no hace falta tocar código para nada
de lo que está en esta guía (hay una sección al final con lo poco que **sí**
necesita un cambio de código).

Los cambios tardan **hasta 5 minutos** en verse en el sitio (las páginas
quedan cacheadas ese tiempo para que carguen rápido). Si necesitas que algo
se vea al instante, avísame y lo desplegamos manualmente.

---

## Quiero agregar un perfume nuevo

1. Table Editor → tabla **`products`** → botón **"Insert row"**.
2. Completa:

   | Campo | Qué poner |
   |---|---|
   | `name` | Nombre del perfume, ej. `Dior Sauvage EDP` |
   | `category_slug` | Una de estas 5 (exacto, en minúsculas): `nicho`, `disenador`, `arabes`, `exclusivos`, `damas`. **No uses `promos`** — ver nota abajo. |
   | `price` | Precio base en soles, sin el `S/.` (equivale al tamaño de 5ml — el de 3ml y 10ml se calculan solos, no los toques) |
   | `best_seller` | `true` si quieres que aparezca en "Más Vendidos" del inicio |
   | `on_sale` | `true` solo si está en oferta (ver siguiente sección) |
   | `active` | `true` para que se vea en la tienda |
   | `badge` | Opcional, ej. `MÁS VENDIDO` (texto que aparece como etiqueta) |
   | `image_url` | Déjalo vacío por ahora si no tienes la foto — ver sección de fotos |
   | `description` | Opcional — ver sección de descripción |

3. Guarda. Listo, en unos minutos aparece en el catálogo, en su categoría, y
   en el buscador.

> **Nota sobre `promos`:** existe una categoría llamada `promos` en la tabla
> `categories`, pero es "virtual" — la página de Promociones no filtra por
> categoría, muestra automáticamente **todo producto con `on_sale = true`**,
> sin importar su categoría real. Si le pones `category_slug = promos` a un
> producto, se vuelve invisible en el catálogo normal. Usa siempre una de
> las 5 categorías reales, y el flag `on_sale` aparte para que salga en
> Promociones.

---

## Quiero cambiar el precio de un perfume

Table Editor → `products` → busca la fila → doble clic en la celda `price` →
escribe el nuevo número → Enter. Los precios de 3ml y 10ml se recalculan
solos en cada página (70% y 170% del precio base).

---

## Quiero poner un perfume en oferta (que salga en Promociones)

En esa fila:
- `on_sale` → `true`
- `original_price` → el precio anterior (el que se muestra tachado)
- `price` → el nuevo precio con descuento

Aparece automáticamente en `/promociones` y puede salir destacado en el
inicio si además es `best_seller = true`.

---

## Quiero marcar un perfume como "Más Vendido"

`best_seller` → `true` en esa fila. Aparece en el riel "Más Vendidos" del
inicio (y es candidato a ser el producto del banner principal si además
tiene `on_sale = true`).

---

## Quiero subir o cambiar la foto de un perfume

1. Panel de Supabase → **Storage**. Si todavía no existe, crea un bucket
   (ej. `product-images`) y márcalo como **público**.
2. Sube la foto ahí.
3. Clic en el archivo subido → **"Copy URL"** (la URL pública, no la
   privada).
4. Table Editor → `products` → pega esa URL en la columna `image_url` de la
   fila del perfume.

Mientras `image_url` esté vacío, el sitio muestra un cuadro gris con
"Foto próximamente" en su lugar — no se rompe nada, solo se ve el
placeholder.

---

## Quiero escribir/editar la descripción de un perfume

Columna `description` en `products` — texto libre, hasta 2000 caracteres. Si
la dejas vacía, la página del producto muestra el texto genérico de siempre
("Decant 100% original, envasado y sellado..."). Si escribes algo, se
muestra eso en su lugar.

---

## Quiero ocultar o eliminar un perfume

- **Ocultar (recomendado):** pon `active` en `false`. Desaparece de la
  tienda pero el historial de pedidos que ya lo incluyeron sigue intacto.
- **Eliminar de verdad:** si el perfume nunca fue pedido, puedes borrar la
  fila normalmente. Si **ya tiene pedidos asociados**, Supabase va a
  **rechazar el borrado** (por seguridad, para no perder el historial de
  ventas) — en ese caso usa `active = false` en su lugar.

---

## Quiero agregar o editar una categoría

Table Editor → tabla **`categories`**:

| Campo | Qué es |
|---|---|
| `slug` | Identificador único, sin espacios ni tildes (ej. `unisex`) — es el que va en la URL `/categoria/unisex` |
| `name` | Nombre que se muestra (ej. `Unisex`) |
| `subtitle` | Texto chico debajo del nombre en "Arma tu Combo" (ej. marcas destacadas) |
| `desde` | Precio "Desde S/. X" que se muestra en Arma tu Combo |
| `sort_order` | Número para el orden en que aparecen (menor = primero) |

Una categoría nueva funciona sola en el catálogo, la página de categoría y
"Arma tu Combo" — no hace falta ningún cambio de código. Evita renombrar o
borrar la categoría `promos` (ver nota más arriba).

---

## Quiero editar los testimonios del inicio

Table Editor → tabla **`testimonials`**: `name`, `stars` (1 a 5), `text`,
`sort_order`. Agrega, edita o borra filas libremente.

---

## Quiero ver los pedidos que han llegado

El sitio web **no puede leer** la tabla `orders` (a propósito, por
seguridad), pero tú sí, como dueño del proyecto:

- Table Editor → tabla **`orders`** para ver los datos del pedido (cliente,
  dirección, método de envío, total, estado).
- Tabla **`order_items`** para ver qué productos incluyó cada pedido
  (`order_id` conecta con `orders.id`).

Atajo más cómodo — en el **SQL Editor**, pega y corre:

```sql
select order_number, created_at, customer_name, customer_phone,
       shipping_method, total, status
from orders
order by created_at desc
limit 50;
```

Y para ver los productos de un pedido puntual (cambia el número):

```sql
select oi.product_name, oi.size, oi.qty, oi.unit_price, oi.is_combo
from order_items oi
join orders o on o.id = oi.order_id
where o.order_number = 1005;
```

---

## Quiero ver los mensajes del formulario de Contacto

Table Editor → tabla **`contact_messages`**. Puedes marcar `handled` en
`true` una vez que respondiste, para llevar el control.

---

## Lo que NO se puede cambiar desde Supabase (necesita tocar código)

- **Número de WhatsApp y links de Instagram/TikTok** — están fijos en
  `src/lib/constants.ts`, no en la base de datos.
- El diseño, textos fijos de las páginas, costo de envío de Lima, reglas de
  descuento del combo, etc.
- Agregar un método de envío nuevo, una pasarela de pago, etc.

Para cualquiera de estos, dime qué quieres cambiar y lo hago yo.

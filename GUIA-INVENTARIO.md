# Guía: cómo manejar el catálogo de DEYCAZ

Desde que existe el **panel administrativo** (`/admin`), esta es la forma
normal de manejar productos, categorías, pedidos y clientes — ya no hace
falta entrar al Table Editor de Supabase para nada de eso. Esta guía queda
para lo poco que el admin todavía no cubre (testimonios, mensajes de
contacto) y como referencia de qué significa cada campo.

Entra a `deycaz.store/admin/login` con tu cuenta de administrador. Los
cambios que hagas ahí se ven **al toque** en el sitio (el admin fuerza la
actualización); si algo lo cambia otra persona directo en Supabase Studio,
ese cambio sí puede tardar hasta 5 minutos en verse.

---

## Quiero agregar un perfume nuevo

Admin → **Productos** → botón **"Nuevo producto"**. El formulario tiene
pestañas:

| Pestaña | Qué se carga |
|---|---|
| **General** | Nombre, categoría, badge (texto opcional tipo "MÁS VENDIDO") |
| **Precio** | Precio base (5ml, obligatorio), precios de 3ml/10ml/frasco entero (opcionales), precio "antes" si está en oferta |
| **Inventario** | Activo (visible en la tienda), Más vendido (aparece en el riel del inicio) |
| **Imágenes** | Foto principal, foto por tamaño, galería general (ver sección de fotos) |
| **SEO** | Descripción del producto (ver sección de descripción) |

> **Sobre los precios por tamaño**: no hay ninguna fórmula automática. Si
> no cargas un precio de 3ml, 10ml o frasco entero, ese tamaño simplemente
> **no aparece** como opción en la página del producto ni se puede pedir —
> no calcula nada solo. Carga el precio de cada tamaño que quieras ofrecer.

---

## Quiero cambiar el precio de un perfume

Admin → **Productos** → clic en el perfume → pestaña **Precio** → edita el
campo que corresponda → Guardar. Se refleja al toque en el sitio.

---

## Quiero poner un perfume en oferta (que salga en Promociones)

En el formulario del producto:
- Pestaña **Precio**: activa "En oferta", pon el precio anterior (el que se
  muestra tachado) y el precio nuevo con descuento en el campo de precio
  base.

Aparece automáticamente en `/promociones` y puede salir destacado en el
inicio si además está marcado como "Más vendido".

---

## Quiero marcar un perfume como "Más Vendido"

Pestaña **Inventario** → activa "Más vendido". Aparece en el riel "Más
Vendidos" del inicio.

---

## Quiero subir o cambiar la foto de un perfume

Admin → **Productos** → clic en el perfume → pestaña **Imágenes**. Hay tres
tipos de foto:

- **Principal** — la que se ve en las tarjetas del catálogo y el inicio.
  Subir/reemplazar es un solo paso (no hace falta marcarla como principal
  aparte).
- **Por tamaño** (3ml/5ml/10ml/frasco) — reemplaza a la principal en la
  página del producto cuando el cliente elige ese tamaño específico. Es
  opcional; si no la subís, se ve la principal para ese tamaño también.
- **Galería** — fotos sueltas adicionales, aparecen como miniaturas
  clicables en la página del producto.

Las fotos se comprimen solas en el navegador antes de subirse (no hace
falta achicarlas vos antes) y además se **recortan solas para que el
frasco quede siempre del mismo tamaño relativo** en la foto final —
tomando como referencia cómo se ve Erba Pura. No hace falta que vos
dejes el mismo margen a mano en cada foto antes de subirla: si en una
foto el frasco queda muy pegado a los bordes y en otra muy chico en el
medio, el sitio las pareja solo para que no se vean unas "más grandes"
que otras en la página del producto. (Funciona mejor con fondo liso de
un solo color, como las fotos que ya tiene el catálogo — si el fondo no
es liso, la foto se sube igual pero sin ese ajuste automático.)

Mientras un producto no tenga foto, el sitio muestra un cuadro con "Foto
próximamente" — no se rompe nada.

---

## Quiero escribir/editar la descripción de un perfume

Pestaña **SEO** del producto → campo de descripción, texto libre hasta
2000 caracteres. Se muestra en la sección desplegable "Producto" de la
página del perfume (abierta por defecto). Si la dejás vacía, se muestra
"Descripción disponible próximamente." en su lugar.

Los saltos de línea que escribas se respetan tal cual en el sitio — podés
usar un formato con líneas separadas, por ejemplo:

```
Dulce, juvenil y adictivo. Un clásico nocturno lleno de cumplidos.

-> Ocasión: Citas, fiestas y salidas nocturnas donde quieres destacar.
-> Notas: Manzana, vainilla, canela y ámbar.
```

(La sección "Envíos y Devoluciones" que aparece debajo, cerrada por
defecto, es un texto fijo igual para todos los productos — no se edita
por producto.)

---

## Quiero ocultar o eliminar un perfume

- **Ocultar (recomendado):** en el formulario del producto, pestaña
  Inventario, desactivá "Activo". Desaparece de la tienda pero el
  historial de pedidos que ya lo incluyeron sigue intacto.
- **Eliminar de verdad:** desde la tabla de Productos del admin, menú de
  acciones → Eliminar. Si el perfume **ya tiene pedidos asociados**,
  Supabase va a **rechazar el borrado** (por seguridad, para no perder el
  historial de ventas) — en ese caso usá "Activo = No" en su lugar.

---

## Quiero agregar o editar una categoría

Admin → **Categorías** → "Nueva categoría" o clic en una existente:

| Campo | Qué es |
|---|---|
| Slug | Identificador único, sin espacios ni tildes (ej. `unisex`) — va en la URL `/categoria/unisex`. No se puede editar después de creada. |
| Nombre | Nombre que se muestra (ej. `Unisex`) |
| Subtítulo | Texto chico debajo del nombre en "Arma tu Combo" |
| Precio "Desde S/." | Se muestra en Arma tu Combo |
| Orden | Número para el orden en que aparecen (menor = primero) |
| Foto de fondo | Solo al editar una categoría ya creada — la foto detrás del nombre en los tiles de inicio y `/catalogo`. Sin foto, el tile queda con fondo oscuro liso. |

Una categoría nueva funciona sola en el catálogo y en la página de
categoría — no hace falta ningún cambio de código. Evita renombrar o
borrar la categoría `promos`: es "virtual", la página de Promociones no
filtra por categoría, muestra automáticamente **todo producto con "En
oferta" activado**, sin importar su categoría real.

> **"Arma tu Combo" es la excepción**: ahí solo se puede elegir entre
> Nicho, Diseñador, Árabes y Exclusivos — Damas se excluyó a propósito de
> esa selección puntual (pedido explícito). El resto del sitio (catálogo,
> menú, `/categoria/damas`) sigue mostrando Damas normal. **Si agregás una
> categoría nueva, NO aparece en Arma tu Combo por defecto** (a diferencia
> de antes): cada categoría de Arma tu Combo necesita su propia tabla de
> descuentos por tamaño cargada en el código
> (`COMBO_PAIR_DISCOUNT_TABLE` en `src/lib/bundleDiscount.ts`, espejada en
> Supabase), así que una categoría nueva sin esa tabla directamente no
> sale como opción ahí hasta que se agregue a mano. Avisame si creás una
> categoría que también debería vender en Arma tu Combo.

---

## Quiero ver los pedidos que han llegado

Admin → **Pedidos** — lista completa con filtro por estado y método de
envío, clic en uno para ver el detalle (productos, cliente, dirección,
total). Ahí mismo podés cambiar el estado del pedido (pendiente,
confirmado, enviado, entregado, cancelado).

Si necesitás algo que la tabla no te da (un reporte puntual, por ejemplo),
alternativa por SQL Editor de Supabase:

```sql
select order_number, created_at, customer_name, customer_phone,
       shipping_method, subtotal, discount, total, status
from orders
order by created_at desc
limit 50;
```

---

## Quiero ver mis clientes

Admin → **Clientes** — se arma automáticamente a partir del historial de
pedidos (agrupado por celular), con cantidad de pedidos y total gastado por
persona. No es una tabla propia, así que no hay nada que cargar ahí a mano.

---

## Quiero editar los testimonios del inicio

Esto **todavía no tiene pantalla en el admin** — se hace desde el Table
Editor de Supabase, tabla **`testimonials`**: `name`, `stars` (1 a 5),
`text`, `sort_order`, `image_url` (opcional). Agrega, edita o borra filas
libremente.

---

## Quiero ver los mensajes del formulario de Contacto

Esto tampoco tiene pantalla en el admin todavía — Table Editor de
Supabase, tabla **`contact_messages`** (`name`, `email`, `phone`,
`message`). Podés marcar `handled` en `true` una vez que respondiste,
para llevar el control.

Además, cada mensaje nuevo dispara un aviso por email a
`joakinalvavega4@gmail.com` (vía Resend) — si ese email no llega pero el
mensaje sí está en la tabla, revisá que `RESEND_API_KEY` siga configurada
en las variables de entorno de Vercel.

---

## Lo que NO se puede cambiar desde el admin ni desde Supabase (necesita tocar código)

- **Número de WhatsApp y links de Instagram/TikTok** — fijos en
  `src/lib/constants.ts`.
- El diseño, textos fijos de las páginas, costo de envío de Lima, niveles
  de descuento de "Arma tu Combo", el texto fijo de "Envíos y Devoluciones"
  del PDP.
- Agregar un método de envío nuevo, una pasarela de pago, un rol de admin
  nuevo (hoy solo existe `owner`), o un módulo nuevo del admin (testimonios,
  mensajes de contacto).

Para cualquiera de estos, dime qué querés cambiar y lo hago yo.

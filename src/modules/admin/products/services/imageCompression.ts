// Resize/compresión client-side con <canvas> nativo antes de subir a
// Supabase Storage — sin agregar una librería nueva solo para esto.
const MAX_DIMENSION = 1600;
const QUALITY = 0.82;

// Composición de referencia para `normalizeComposition`: medida a mano
// (script con sharp, detectando dónde termina el fondo liso y empieza el
// frasco) sobre las fotos de Erba Pura/Khamrah/Afnan 9PM, que ya se ven
// bien en el sitio — el producto ocupa ~53% del alto del cuadro final,
// con ~30% de margen arriba. Sin esto, dos fotos igual de "bien
// recortadas" a simple vista podían mostrarse con hasta ~10 puntos
// porcentuales de diferencia de tamaño en el PDP (medido: una foto con el
// producto al 64% del cuadro contra el resto al ~53%), porque el sitio
// siempre muestra la foto completa en el mismo cuadro cuadrado — el
// margen que trae la foto original es, en los hechos, el tamaño con el
// que se ve el producto.
const TARGET_HEIGHT_RATIO = 0.53;
const TARGET_TOP_RATIO = 0.3;

// Umbral de diferencia de color (suma de |ΔR|+|ΔG|+|ΔB|) para considerar
// un píxel "no es fondo". Se detecta a baja resolución (DETECT_SIZE) y
// se escala el resultado a las coordenadas reales de la foto — escanear
// pixel por pixel a resolución completa (fotos de cámara de varios miles
// de px de lado) sería visiblemente lento en el navegador.
const BG_DIFF_THRESHOLD = 18;
const DETECT_SIZE = 200;

// Muchas fotos de referencia de este catálogo traen el frasco Y el
// tester chico al lado (mismo estilo que Erba Pura) — son dos manchas
// separadas, no una sola. Medido sobre fotos reales: el tester pesa
// 12-23% del tamaño del frasco según la foto, mientras que un elemento
// suelto que hay que ignorar (un destello decorativo, polvo) pesa <1%.
// Se incluye cualquier mancha de al menos este % del tamaño de la más
// grande, no solo la más grande — si no, el recorte se calculaba
// ignorando por completo dónde queda el tester.
const MIN_COMPONENT_SIZE_RATIO = 0.05;

export type CompressOptions = {
  /** Recompone la foto para que el producto ocupe siempre el mismo % del
   * cuadro (ver constantes de arriba), sin importar cuánto margen tenía
   * la foto original. Pensado para fotos de producto sobre fondo liso —
   * las de categoría son fotos de ambiente, ahí no aplica. */
  normalizeComposition?: boolean;
};

type BBox = { minX: number; minY: number; maxX: number; maxY: number };

type Component = BBox & { size: number };

function findComponents(mask: Uint8Array, width: number, height: number): Component[] {
  const n = width * height;
  const labeled = new Int8Array(n); // 0 = sin visitar, 1 = visitado
  const stack = new Int32Array(n);
  const components: Component[] = [];

  for (let start = 0; start < n; start++) {
    if (mask[start] === 0 || labeled[start] === 1) continue;
    let top = 0;
    stack[top++] = start;
    labeled[start] = 1;
    let minX = width;
    let maxX = -1;
    let minY = height;
    let maxY = -1;
    let size = 0;
    while (top > 0) {
      const idx = stack[--top];
      const x = idx % width;
      const y = (idx / width) | 0;
      size++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (x > 0 && mask[idx - 1] === 1 && labeled[idx - 1] === 0) {
        labeled[idx - 1] = 1;
        stack[top++] = idx - 1;
      }
      if (x < width - 1 && mask[idx + 1] === 1 && labeled[idx + 1] === 0) {
        labeled[idx + 1] = 1;
        stack[top++] = idx + 1;
      }
      if (idx - width >= 0 && mask[idx - width] === 1 && labeled[idx - width] === 0) {
        labeled[idx - width] = 1;
        stack[top++] = idx - width;
      }
      if (idx + width < n && mask[idx + width] === 1 && labeled[idx + width] === 0) {
        labeled[idx + width] = 1;
        stack[top++] = idx + width;
      }
    }
    components.push({ minX, minY, maxX, maxY, size });
  }

  return components;
}

/**
 * Bbox unión de los componentes conectados de píxeles "no fondo" que sean
 * al menos `MIN_COMPONENT_SIZE_RATIO` del tamaño del más grande — no solo
 * el más grande, ni tampoco todos. Probado con dos fotos reales: Lattafa
 * Eclaire tenía un destello decorativo suelto en una esquina (<1% del
 * frasco) que si se incluía descentraba el recorte entero; Lattafa
 * Khamrah trae el frasco Y el tester chico al lado como dos manchas
 * separadas (12-23% del frasco según la foto, mismo estilo que Erba
 * Pura) que si se ignoraban por completo dejaban el recorte calculado
 * sin contemplar dónde queda el tester.
 */
function detectBBox(data: Uint8ClampedArray, width: number, height: number): BBox | null {
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];
  const n = width * height;
  const mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const p = i * 4;
    const diff = Math.abs(data[p] - bgR) + Math.abs(data[p + 1] - bgG) + Math.abs(data[p + 2] - bgB);
    mask[i] = diff > BG_DIFF_THRESHOLD ? 1 : 0;
  }

  const components = findComponents(mask, width, height);
  if (components.length === 0) return null;

  const maxSize = Math.max(...components.map((c) => c.size));
  const kept = components.filter((c) => c.size >= maxSize * MIN_COMPONENT_SIZE_RATIO);

  return {
    minX: Math.min(...kept.map((c) => c.minX)),
    maxX: Math.max(...kept.map((c) => c.maxX)),
    minY: Math.min(...kept.map((c) => c.minY)),
    maxY: Math.max(...kept.map((c) => c.maxY)),
  };
}

/**
 * Recorta/reencuadra para que el producto quede al mismo % del cuadro que
 * la referencia. Devuelve `null` (no `canvas` original) si la detección no
 * parece confiable — un fondo que no es liso, o el color de la esquina
 * coincidiendo con el propio producto — para que quien llama use el
 * resize plano de siempre en vez de un recorte inventado sobre datos
 * malos. Más vale una foto sin normalizar que una mal recortada.
 */
function normalizeComposition(bitmap: ImageBitmap): HTMLCanvasElement | null {
  const detectCanvas = document.createElement("canvas");
  detectCanvas.width = DETECT_SIZE;
  detectCanvas.height = DETECT_SIZE;
  const detectCtx = detectCanvas.getContext("2d", { willReadFrequently: true });
  if (!detectCtx) return null;
  detectCtx.drawImage(bitmap, 0, 0, DETECT_SIZE, DETECT_SIZE);

  const { data } = detectCtx.getImageData(0, 0, DETECT_SIZE, DETECT_SIZE);
  const bbox = detectBBox(data, DETECT_SIZE, DETECT_SIZE);
  if (!bbox) return null;

  const bboxWRatio = (bbox.maxX - bbox.minX) / DETECT_SIZE;
  const bboxHRatio = (bbox.maxY - bbox.minY) / DETECT_SIZE;
  if (bboxHRatio < 0.05 || bboxHRatio > 0.95 || bboxWRatio > 0.95) return null;

  const bg: [number, number, number] = [data[0], data[1], data[2]];

  // Bbox del canvas chico de detección → coordenadas de la foto real.
  const scaleX = bitmap.width / DETECT_SIZE;
  const scaleY = bitmap.height / DETECT_SIZE;
  const bx0 = bbox.minX * scaleX;
  const bx1 = bbox.maxX * scaleX;
  const by0 = bbox.minY * scaleY;
  const by1 = bbox.maxY * scaleY;
  const bboxH = by1 - by0;
  const bboxCenterX = (bx0 + bx1) / 2;

  const cropSize = bboxH / TARGET_HEIGHT_RATIO;
  const cropLeft = bboxCenterX - cropSize / 2;
  const cropTop = by0 - TARGET_TOP_RATIO * cropSize;
  const finalSize = Math.round(Math.min(MAX_DIMENSION, cropSize));

  const outCanvas = document.createElement("canvas");
  outCanvas.width = finalSize;
  outCanvas.height = finalSize;
  const outCtx = outCanvas.getContext("2d");
  if (!outCtx) return null;

  // Se rellena con el color de fondo detectado ANTES de dibujar: si el
  // recorte calculado se sale del borde de la foto original (el producto
  // ya estaba pegado a un borde), ese sobrante queda del mismo color que
  // el fondo real en vez de transparente/negro. Se dibuja la foto entera
  // (nunca un rectángulo-fuente fuera de sus límites, que el spec de
  // Canvas no garantiza igual entre navegadores) posicionada/escalada para
  // que el recorte calculado caiga exacto sobre el canvas de salida.
  outCtx.fillStyle = `rgb(${bg[0]}, ${bg[1]}, ${bg[2]})`;
  outCtx.fillRect(0, 0, finalSize, finalSize);

  const scale = finalSize / cropSize;
  outCtx.drawImage(
    bitmap,
    0,
    0,
    bitmap.width,
    bitmap.height,
    -cropLeft * scale,
    -cropTop * scale,
    bitmap.width * scale,
    bitmap.height * scale,
  );

  return outCanvas;
}

function plainResizeCanvas(bitmap: ImageBitmap): HTMLCanvasElement | null {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas;
}

export async function compressImage(file: File, options: CompressOptions = {}): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const canvas = (options.normalizeComposition && normalizeComposition(bitmap)) || plainResizeCanvas(bitmap);
  bitmap.close();
  if (!canvas) return file;

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", QUALITY));
  if (!blob) return file;

  return new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
}

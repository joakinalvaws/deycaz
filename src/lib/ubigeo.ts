export type Provincia = { id: string; nombre: string; etiqueta: string };
export type Distrito = { id: string; nombre: string };

/** Lima + Callao ("Lima Metropolitana") — la zona que cubre Delivery (Lima).
 * Se excluyen de la lista de provincias de Shalom porque esa zona ya se
 * cubre con el otro método de envío. */
export const LIMA_METRO_PROVINCIA_IDS = ["3927", "3285"];

let provinciasCache: Promise<Provincia[]> | null = null;
let limaMetroDistritosCache: Promise<Distrito[]> | null = null;
const distritosCache = new Map<string, Promise<Distrito[]>>();

/** Lista completa de provincias del Perú (~194), cargada una sola vez desde
 * `/public/ubigeo/provincias.json` (dataset del INEI, vía ubigeos-peru). */
export function getProvincias(): Promise<Provincia[]> {
  if (!provinciasCache) {
    provinciasCache = fetch("/ubigeo/provincias.json").then((r) => r.json());
  }
  return provinciasCache;
}

/** Distritos de una provincia, cargados bajo demanda (un archivo pequeño por
 * provincia) solo cuando el usuario la selecciona. */
export function getDistritos(provinciaId: string): Promise<Distrito[]> {
  let cached = distritosCache.get(provinciaId);
  if (!cached) {
    cached = fetch(`/ubigeo/distritos/${provinciaId}.json`).then((r) => r.json());
    distritosCache.set(provinciaId, cached);
  }
  return cached;
}

/** Distritos combinados de Lima + Callao, para el método "Delivery (Lima)":
 * ahí no tiene sentido pedir provincia (siempre sería Lima/Callao), solo el
 * distrito dentro de esa zona. */
export function getDistritosLimaMetropolitana(): Promise<Distrito[]> {
  if (!limaMetroDistritosCache) {
    limaMetroDistritosCache = Promise.all(LIMA_METRO_PROVINCIA_IDS.map(getDistritos)).then((lists) =>
      lists.flat().sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
    );
  }
  return limaMetroDistritosCache;
}

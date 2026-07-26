const MESSAGE = "ENVÍOS A TODO EL PERÚ  |  DELIVERY GRATIS + S/. 250";

// La animación va de 0% a -50%: para que el loop sea invisible, el ancho
// total del contenido (REPEAT_COUNT copias) tiene que ser al menos el doble
// del viewport más ancho posible — si no, sobre pantallas anchas se termina
// de recorrer todo el contenido antes de que el loop reinicie, y queda un
// hueco del fondo (bg-foreground) visible hasta que "regenera". 16 copias
// da margen de sobra incluso en monitores muy anchos.
const REPEAT_COUNT = 16;

export function Marquee() {
  return (
    <div className="overflow-hidden bg-foreground py-2.5">
      <div className="animate-marquee flex w-max">
        {Array.from({ length: REPEAT_COUNT }).map((_, i) => (
          <span
            key={i}
            className="whitespace-nowrap px-10 text-xs font-semibold tracking-wide text-white"
          >
            {MESSAGE}
          </span>
        ))}
      </div>
    </div>
  );
}

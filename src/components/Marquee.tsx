const MESSAGE = "ENVÍOS A TODO EL PERÚ  |  DELIVERY GRATIS + S/. 250";

export function Marquee() {
  return (
    <div className="overflow-hidden bg-foreground py-2.5">
      <div className="animate-marquee flex w-max">
        {Array.from({ length: 4 }).map((_, i) => (
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

"use client";

import { useEffect } from "react";

type TikTokEmbedProps = {
  url: string;
  videoId: string;
  maxWidth?: number;
};

// El script oficial de TikTok (embed.js) solo escanea el DOM una vez, al
// cargar. En una SPA de Next.js, si este componente se desmonta (navegación
// client-side) y se vuelve a montar, un <script> ya presente en el <head>
// no se re-ejecuta — por eso se inyecta y se remueve en cada montaje, para
// forzar un nuevo escaneo que convierta el <blockquote> en el iframe real.
export function TikTokEmbed({ url, videoId, maxWidth = 325 }: TikTokEmbedProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [videoId]);

  const handle = url.match(/@([\w.-]+)/)?.[1];

  return (
    <blockquote
      className="tiktok-embed mx-auto"
      cite={url}
      data-video-id={videoId}
      style={{ maxWidth, minWidth: 325 }}
    >
      <section>
        {handle && (
          <a href={`https://www.tiktok.com/@${handle}?refer=embed`} target="_blank" rel="noopener noreferrer" title={`@${handle}`}>
            @{handle}
          </a>
        )}
      </section>
    </blockquote>
  );
}

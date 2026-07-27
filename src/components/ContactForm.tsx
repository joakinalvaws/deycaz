"use client";

import { useState, useTransition } from "react";
import { submitContact } from "@/app/actions";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (sent) {
    return (
      <div className="bg-cream p-7.5 text-sm">Gracias, recibimos tu mensaje. Te contactaremos pronto.</div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitContact({ name, email, message });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      {/* Los maxLength espejan los límites de `submitContact` y los
          `check (char_length(...))` de la tabla — así el corte se ve al
          tipear en vez de rebotar recién al enviar. */}
      <input
        required
        maxLength={200}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre completo"
        className="border border-border-strong px-3.5 py-3.5 text-[13px] outline-none"
      />
      <input
        required
        type="email"
        maxLength={200}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="border border-border-strong px-3.5 py-3.5 text-[13px] outline-none"
      />
      <textarea
        required
        maxLength={2000}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Mensaje"
        rows={5}
        className="resize-vertical border border-border-strong px-3.5 py-3.5 text-[13px] outline-none"
      />
      {error && <div className="text-sm text-red-600">{error}</div>}
      <button
        type="submit"
        disabled={isPending}
        className="bg-foreground py-4 text-[13px] font-bold tracking-wide text-white disabled:opacity-60"
      >
        {isPending ? "ENVIANDO..." : "ENVIAR MENSAJE"}
      </button>
    </form>
  );
}

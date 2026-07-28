const RESEND_API_URL = "https://api.resend.com/emails";
const CONTACT_NOTIFICATION_TO = "joakinalvavega4@gmail.com";

type ContactNotificationInput = { name: string; email: string; phone: string; message: string };

/** Envía un aviso por email cuando llega un mensaje nuevo del formulario de
 * Contacto — fetch directo a la API REST de Resend (sin agregar su SDK
 * como dependencia solo para esto). Si falta RESEND_API_KEY o el envío
 * falla, no revienta el envío del formulario — el mensaje ya quedó
 * guardado en Supabase de todas formas; el email es un aviso adicional,
 * no la fuente de verdad. */
export async function sendContactNotificationEmail(input: ContactNotificationInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY no configurada — no se pudo enviar el aviso de contacto por email.");
    return;
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "DEYCAZ <onboarding@resend.dev>",
        to: [CONTACT_NOTIFICATION_TO],
        reply_to: input.email,
        subject: `Nuevo mensaje de contacto — ${input.name}`,
        text: `Nombre: ${input.name}\nEmail: ${input.email}\nTeléfono: ${input.phone}\n\nMensaje:\n${input.message}`,
      }),
    });
    if (!res.ok) {
      console.error("No se pudo enviar el aviso de contacto por email:", res.status, await res.text());
    }
  } catch (err) {
    console.error("No se pudo enviar el aviso de contacto por email:", err);
  }
}

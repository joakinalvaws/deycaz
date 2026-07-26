import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!rawUrl || !rawAnonKey) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Copia .env.local.example a .env.local y completa las credenciales de tu proyecto Supabase.",
  );
}

const supabaseUrl: string = rawUrl;
const supabaseAnonKey: string = rawAnonKey;

/**
 * Cliente Supabase para Server Components/Actions dentro de `/admin`, con
 * las cookies de sesión del usuario logueado — igual que el cliente del
 * navegador, todo queda gateado por RLS (`is_admin()`), nunca por la
 * service role key.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Llamado desde un Server Component (no puede escribir cookies) —
          // se ignora porque proxy.ts ya se encarga de refrescar la sesión.
        }
      },
    },
  });
}

import { createBrowserClient } from "@supabase/ssr";
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
 * Cliente Supabase del navegador, usado solo dentro de `/admin` (por los
 * hooks de TanStack Query). Lleva la cookie de sesión del usuario logueado
 * — todo lo que puede leer/escribir queda gateado por las policies RLS de
 * `is_admin()` (ver supabase/migrations/0007_admin_auth.sql), nunca por la
 * service role key. El sitio público sigue usando el cliente anon de
 * `src/lib/supabase.ts`, sin tocar.
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

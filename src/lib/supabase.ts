import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Copia .env.local.example a .env.local y completa las credenciales de tu proyecto Supabase.",
  );
}

/**
 * Cliente único con la clave anónima. Todas las lecturas (catálogo) y
 * escrituras públicas (pedidos, contacto) pasan por RLS policies definidas
 * en supabase/schema.sql — no se usa la service role key en el sitio.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

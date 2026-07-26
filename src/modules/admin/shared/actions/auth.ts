"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { LoginInput } from "@/modules/admin/shared/schemas/auth";

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function loginAction(input: LoginInput): Promise<LoginResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(input);

  if (error || !data.user) {
    return { ok: false, error: "Credenciales inválidas." };
  }

  // `admin_users` tiene RLS sin ninguna policy (a propósito) — ni siquiera
  // el propio usuario puede leer su fila directamente. `is_admin()` es
  // security definer, así que sí puede.
  const { data: isAdmin } = await supabase.rpc("is_admin");

  if (!isAdmin) {
    await supabase.auth.signOut();
    return { ok: false, error: "Esta cuenta no tiene acceso al panel administrativo." };
  }

  return { ok: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

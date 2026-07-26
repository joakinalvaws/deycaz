import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/modules/admin/shared/actions/auth";
import { AdminSidebarNav } from "@/modules/admin/shared/components/AdminSidebarNav";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

// `proxy.ts` ya protege todo /admin/* — este chequeo es defensa en
// profundidad (Next recomienda no confiar solo en el proxy, ver
// node_modules/next/dist/docs/.../proxy.md).
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // `admin_users` tiene RLS sin ninguna policy (a propósito) — hay que
  // pasar por `is_admin()` (security definer), consultar la tabla directo
  // siempre da vacío. El email se muestra desde el propio usuario de Auth,
  // no hace falta leer la tabla para eso.
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/admin/login?error=no-admin");

  return { email: user.email ?? "" };
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const adminUser = await requireAdmin();

  return (
    <>
      <Sidebar>
        <SidebarHeader className="px-4 py-3">
          <span className="font-serif text-lg font-bold tracking-[2px]">DEYCAZ</span>
          <span className="text-muted-foreground text-xs">Panel administrativo</span>
        </SidebarHeader>
        <SidebarContent>
          <AdminSidebarNav />
        </SidebarContent>
        <SidebarFooter className="gap-2 px-4 py-3">
          <p className="text-muted-foreground truncate text-xs">{adminUser.email}</p>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm" className="w-full justify-start gap-2">
              <LogOut className="size-4" />
              Cerrar sesión
            </Button>
          </form>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </>
  );
}

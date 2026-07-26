"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Users,
  Boxes,
  Tag,
  Ticket,
  BarChart3,
  UserCog,
  Settings,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

// Fase 1: Dashboard/Productos/Pedidos/Categorías/Clientes a fondo. El resto
// se muestra igual (para que la información arquitectónica del panel esté
// completa desde ya) pero deshabilitado con badge "Próximamente" hasta que
// se construya en una fase siguiente — ver plan de arquitectura.
const ACTIVE_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/categorias", label: "Categorías", icon: FolderTree },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
];

const UPCOMING_ITEMS: NavItem[] = [
  { href: "#", label: "Inventario", icon: Boxes },
  { href: "#", label: "Marcas", icon: Tag },
  { href: "#", label: "Cupones", icon: Ticket },
  { href: "#", label: "Analytics", icon: BarChart3 },
  { href: "#", label: "Usuarios", icon: UserCog },
  { href: "#", label: "Configuración", icon: Settings },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Panel</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {ACTIVE_ITEMS.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton isActive={isActive(item.href)} render={<Link href={item.href} />}>
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Próximamente</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {UPCOMING_ITEMS.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton disabled>
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>Pronto</SidebarMenuBadge>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

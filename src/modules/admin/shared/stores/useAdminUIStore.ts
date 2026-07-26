import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Estado de interfaz del panel admin — nunca datos del servidor (productos,
 * pedidos viven en TanStack Query). El colapsado/expandido de la barra
 * lateral ya lo maneja el propio `SidebarProvider` de shadcn (con su propia
 * cookie); acá solo van preferencias de UI que ese componente no cubre,
 * como los filtros persistentes por listado dentro de la sesión.
 */
type AdminUIState = {
  productFilters: { onlyActive: boolean; categorySlug: string | null };
  setProductFilters: (filters: Partial<AdminUIState["productFilters"]>) => void;

  orderFilters: { status: string | null; shippingMethod: string | null };
  setOrderFilters: (filters: Partial<AdminUIState["orderFilters"]>) => void;
};

export const useAdminUIStore = create<AdminUIState>()(
  persist(
    (set) => ({
      productFilters: { onlyActive: false, categorySlug: null },
      setProductFilters: (filters) =>
        set((state) => ({ productFilters: { ...state.productFilters, ...filters } })),

      orderFilters: { status: null, shippingMethod: null },
      setOrderFilters: (filters) =>
        set((state) => ({ orderFilters: { ...state.orderFilters, ...filters } })),
    }),
    { name: "deycaz-admin-ui" },
  ),
);

"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        {children}
        {/* top-right y 1s: abajo a la derecha (default de sonner) tapaba el
            botón de guardar de los formularios, obligando a esperar a que
            se fuera sola para poder volver a tocarlo. duration acá es el
            default de TODOS los toast.success/error del admin (22
            call-sites) — ninguno fija su propia duración, así que este
            valor único los cubre a todos sin tocarlos uno por uno. */}
        <Toaster position="top-right" duration={1000} />
      </SidebarProvider>
    </QueryClientProvider>
  );
}

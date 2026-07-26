import type { Metadata } from "next";
import { AdminProviders } from "./providers";

// El panel admin no debe indexarse en buscadores.
export const metadata: Metadata = {
  title: { default: "Panel DEYCAZ", template: "%s — Panel DEYCAZ" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/modules/admin/shared/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPEN } from "@/lib/pricing";

async function getDashboardStats() {
  const supabase = await createClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [{ count: ordersToday }, { count: pendingOrders }, { data: monthOrders }] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString()),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("total").gte("created_at", monthStart.toISOString()),
  ]);

  const revenueMonth = (monthOrders ?? []).reduce((acc, o) => acc + o.total, 0);

  return {
    ordersToday: ordersToday ?? 0,
    pendingOrders: pendingOrders ?? 0,
    revenueMonth,
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <PageHeader title="Dashboard" description="Resumen rápido de la tienda." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-medium">Pedidos hoy</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.ordersToday}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-medium">Pedidos pendientes</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.pendingOrders}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-medium">Ingresos del mes</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">S/. {formatPEN(stats.revenueMonth)}</CardContent>
        </Card>
      </div>
    </div>
  );
}

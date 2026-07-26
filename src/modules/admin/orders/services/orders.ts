import { createClient } from "@/lib/supabase/client";
import type { OrderStatus, ShippingMethod } from "@/modules/admin/shared/types";
import type { Order, OrderWithItems } from "../types";

export type OrderFilters = {
  status?: OrderStatus | null;
  shippingMethod?: ShippingMethod | null;
};

export async function listOrders(filters: OrderFilters = {}): Promise<Order[]> {
  const supabase = createClient();
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.shippingMethod) query = query.eq("shipping_method", filters.shippingMethod);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getOrder(id: string): Promise<OrderWithItems> {
  const supabase = createClient();
  const { data, error } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const supabase = createClient();
  const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

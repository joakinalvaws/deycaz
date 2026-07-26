import type { OrderStatus, ShippingMethod } from "@/modules/admin/shared/types";

export type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  dni: string | null;
  provincia: string;
  distrito: string;
  customer_address: string;
  shalom_agency: string | null;
  shipping_method: ShippingMethod;
  shipping_cost: number;
  notes: string | null;
  payment_method: "cod";
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  created_at: string;
};

export type OrderItem = {
  id: number;
  order_id: string;
  product_id: number;
  product_name: string;
  size: "3" | "5" | "10" | "full";
  unit_price: number;
  qty: number;
  is_combo: boolean;
};

export type OrderWithItems = Order & { order_items: OrderItem[] };

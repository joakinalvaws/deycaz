// Tipos compartidos entre módulos del admin (reflejan enums del schema).
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type ShippingMethod = "lima_delivery" | "shalom_provincia";

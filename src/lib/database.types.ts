// Tipos manuales que reflejan supabase/schema.sql.
// Si generas tipos oficiales más adelante (`supabase gen types typescript`),
// puedes reemplazar este archivo por el generado sin tocar el resto del código.
//
// Nota: cada tabla necesita `Relationships: []` y el schema necesita `Views`
// (aunque estén vacíos) porque @supabase/postgrest-js exige esa forma exacta
// (`GenericSchema`) para poder tipar `.from()` / `.rpc()` — si falta alguno,
// TypeScript descarta el esquema completo silenciosamente.

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          slug: string;
          name: string;
          subtitle: string | null;
          desde: number | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & {
          slug: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: number;
          name: string;
          category_slug: string;
          price: number;
          original_price: number | null;
          badge: string | null;
          best_seller: boolean;
          on_sale: boolean;
          image_url: string | null;
          description: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & {
          name: string;
          category_slug: string;
          price: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: number;
          name: string;
          stars: number;
          text: string;
          image_url: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["testimonials"]["Row"]> & {
          name: string;
          text: string;
        };
        Update: Partial<Database["public"]["Tables"]["testimonials"]["Row"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: number;
          customer_name: string;
          customer_phone: string;
          dni: string | null;
          provincia: string;
          distrito: string;
          customer_address: string;
          shalom_agency: string | null;
          shipping_method: "lima_delivery" | "shalom_provincia";
          shipping_cost: number;
          notes: string | null;
          payment_method: "cod";
          status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
          subtotal: number;
          discount: number;
          total: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: number;
          order_id: string;
          product_id: number;
          product_name: string;
          size: "3" | "5" | "10";
          unit_price: number;
          qty: number;
          is_combo: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: number;
          name: string;
          email: string;
          message: string;
          handled: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          email: string;
          message: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Row"]>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      place_order: {
        Args: {
          p_customer_name: string;
          p_customer_phone: string;
          p_dni: string | null;
          p_provincia: string;
          p_distrito: string;
          p_customer_address: string;
          p_shalom_agency: string | null;
          p_shipping_method: "lima_delivery" | "shalom_provincia";
          p_notes: string | null;
          p_items: {
            product_id: number;
            size: "3" | "5" | "10";
            qty: number;
            is_combo: boolean;
          }[];
        };
        Returns: number;
      };
    };
  };
};

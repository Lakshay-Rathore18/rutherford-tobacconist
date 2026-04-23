// Auto-generated from Supabase schema. Regen via:
//   npx supabase gen types typescript --project-id kdciyugnljzjlwhnnziv > src/types/supabase.ts
// or mcp__supabase__generate_typescript_types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          created_at: string | null
          email: string | null
          first_order_at: string | null
          id: string
          last_order_at: string | null
          lifetime_packs_bought: number | null
          name: string
          notes: string | null
          phone: string
          preferred_delivery_address: string | null
          total_orders: number | null
          total_spend: number | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_order_at?: string | null
          id?: string
          last_order_at?: string | null
          lifetime_packs_bought?: number | null
          name: string
          notes?: string | null
          phone: string
          preferred_delivery_address?: string | null
          total_orders?: number | null
          total_spend?: number | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_order_at?: string | null
          id?: string
          last_order_at?: string | null
          lifetime_packs_bought?: number | null
          name?: string
          notes?: string | null
          phone?: string
          preferred_delivery_address?: string | null
          total_orders?: number | null
          total_spend?: number | null
        }
        Relationships: []
      }
      delivery_agents: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          name: string
          phone: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name: string
          phone: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          line_total: number
          order_id: string | null
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          line_total: number
          order_id?: string | null
          product_id?: string | null
          product_name: string
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          line_total?: number
          order_id?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          assigned_agent_id: string | null
          confirmation_number: string
          created_at: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          discount: number
          id: string
          notes: string | null
          sms_sent: boolean | null
          sms_sent_at: string | null
          source: Database["public"]["Enums"]["order_source"] | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total_price: number
          updated_at: string | null
          vapi_call_id: string | null
        }
        Insert: {
          assigned_agent_id?: string | null
          confirmation_number: string
          created_at?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          discount?: number
          id?: string
          notes?: string | null
          sms_sent?: boolean | null
          sms_sent_at?: string | null
          source?: Database["public"]["Enums"]["order_source"] | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          total_price: number
          updated_at?: string | null
          vapi_call_id?: string | null
        }
        Update: {
          assigned_agent_id?: string | null
          confirmation_number?: string
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string
          discount?: number
          id?: string
          notes?: string | null
          sms_sent?: boolean | null
          sms_sent_at?: string | null
          source?: Database["public"]["Enums"]["order_source"] | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          total_price?: number
          updated_at?: string | null
          vapi_call_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "delivery_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string | null
          discount_eligible: boolean | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          discount_eligible?: boolean | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          discount_eligible?: boolean | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          brand: string
          category_id: string | null
          created_at: string | null
          id: string
          min_order_qty: number
          name: string
          price: number
          sku: string | null
          stock: number
          updated_at: string | null
          variant: string | null
        }
        Insert: {
          active?: boolean | null
          brand: string
          category_id?: string | null
          created_at?: string | null
          id?: string
          min_order_qty?: number
          name: string
          price: number
          sku?: string | null
          stock?: number
          updated_at?: string | null
          variant?: string | null
        }
        Update: {
          active?: boolean | null
          brand?: string
          category_id?: string | null
          created_at?: string | null
          id?: string
          min_order_qty?: number
          name?: string
          price?: number
          sku?: string | null
          stock?: number
          updated_at?: string | null
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          change: number
          created_at: string | null
          id: string
          product_id: string | null
          reason: string | null
          reference_id: string | null
        }
        Insert: {
          change: number
          created_at?: string | null
          id?: string
          product_id?: string | null
          reason?: string | null
          reference_id?: string | null
        }
        Update: {
          change?: number
          created_at?: string | null
          id?: string
          product_id?: string | null
          reason?: string | null
          reference_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_low_stock: {
        Row: {
          brand: string | null
          id: string | null
          name: string | null
          price: number | null
          stock: number | null
          variant: string | null
        }
        Relationships: []
      }
      v_order_summary: {
        Row: {
          agent_name: string | null
          agent_phone: string | null
          confirmation_number: string | null
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          delivery_address: string | null
          discount: number | null
          id: string | null
          items: Json | null
          sms_sent: boolean | null
          source: string | null
          status: string | null
          subtotal: number | null
          total_price: number | null
        }
        Relationships: []
      }
      v_top_customers: {
        Row: {
          last_order_at: string | null
          lifetime_packs_bought: number | null
          name: string | null
          phone: string | null
          total_orders: number | null
          total_spend: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_confirmation_number: { Args: never; Returns: string }
      get_customer_context: { Args: { p_phone: string }; Returns: Json }
      place_order: {
        Args: {
          p_customer_name: string
          p_customer_phone: string
          p_delivery_address: string
          p_items: Json
          p_source?: string
          p_vapi_call_id?: string
        }
        Returns: Json
      }
      search_products: {
        Args: { search_query: string }
        Returns: {
          brand: string
          category: string
          id: string
          in_stock: boolean
          name: string
          price: number
          stock: number
          variant: string
        }[]
      }
    }
    Enums: {
      order_source: "voice" | "website" | "whatsapp" | "manual"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
    }
    CompositeTypes: Record<string, never>
  }
}

export const Constants = {
  public: {
    Enums: {
      order_source: ["voice", "website", "whatsapp", "manual"],
      order_status: [
        "pending",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const

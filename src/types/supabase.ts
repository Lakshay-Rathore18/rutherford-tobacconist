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
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      notification_campaigns: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      notification_recipients: {
        Row: {
          created_at: string
          customer_id: string | null
          display_name: string | null
          id: string
          last_contacted_at: string | null
          notes: string | null
          opted_in: boolean
          opted_out_at: string | null
          phone: string
          source: string
          total_calls_made: number
          total_sms_sent: number
          updated_at: string
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      notification_sends: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
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
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
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
          source: string | null
          status: string | null
          subtotal: number
          total_price: number
          updated_at: string | null
          vapi_call_id: string | null
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      partner_shops: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string | null
          discount_eligible: boolean | null
          id: string
          name: string
          slug: string
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
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
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      stock_movements: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
    }
    Views: {
      [view: string]: {
        Row: Record<string, unknown>
        Relationships: []
      }
    }
    Functions: {
      assign_driver_to_order: { Args: { p_driver_id: string; p_order_id: string }; Returns: Json }
      complete_delivery: { Args: { p_distance_km?: number; p_order_id: string; p_was_successful?: boolean }; Returns: Json }
      decrement_product_stock: { Args: { p_name: string; p_qty: number }; Returns: Json }
      end_shift: { Args: { p_driver_id: string }; Returns: Json }
      generate_confirmation_number: { Args: Record<string, never>; Returns: string }
      get_available_drivers: { Args: { p_limit?: number; p_zone?: string }; Returns: unknown[] }
      get_campaign_queue: { Args: { p_campaign_id: string; p_channel: string; p_limit?: number }; Returns: unknown[] }
      get_customer_context: { Args: { p_phone: string }; Returns: Json }
      mark_notification_send: { Args: { p_error_text?: string; p_provider_id?: string; p_send_id: string; p_status: string }; Returns: undefined }
      notification_campaign_summary: { Args: { p_campaign_id: string }; Returns: Json }
      opt_out_recipient: { Args: { p_phone: string }; Returns: boolean }
      place_order: { Args: { p_customer_name: string; p_customer_phone: string; p_delivery_address: string; p_items: Json; p_source?: string; p_vapi_call_id?: string }; Returns: Json }
      place_order_from_voice_payload: { Args: { order_record: Json }; Returns: Json }
      register_walkin_customer: { Args: { p_first_name: string; p_last_name: string; p_phone: string; p_source?: string }; Returns: Json }
      resolve_order_items: { Args: { p_items: Json }; Returns: Json }
      search_products: { Args: { search_query: string }; Returns: unknown[] }
      show_limit: { Args: Record<string, never>; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      start_notification_campaign: { Args: { p_channel: string; p_name: string; p_partner_shop_id: string; p_recipient_ids?: string[]; p_sms_template: string; p_voice_brief?: string }; Returns: Json }
      start_shift: { Args: { p_driver_id: string }; Returns: Json }
      update_driver_location: { Args: { p_driver_id: string; p_lat: number; p_lng: number; p_zone?: string }; Returns: Json }
      upsert_notification_recipients: { Args: { p_recipients: Json }; Returns: Json }
    }
    Enums: {
      driver_role: "owner" | "employee" | "contractor" | "casual"
      driver_shift_status:
        | "offline"
        | "available"
        | "on_delivery"
        | "on_break"
        | "suspended"
      driver_vehicle_type:
        | "motorbike"
        | "scooter"
        | "ebike"
        | "bicycle"
        | "car"
        | "van"
        | "on_foot"
      notification_campaign_status:
        | "draft"
        | "queued"
        | "running"
        | "completed"
        | "cancelled"
        | "failed"
      notification_channel: "sms" | "call" | "both"
      notification_send_status:
        | "queued"
        | "sent"
        | "delivered"
        | "failed"
        | "no_answer"
        | "voicemail"
        | "answered"
        | "opted_out"
        | "sending"
      order_source: "voice" | "website" | "whatsapp" | "manual"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

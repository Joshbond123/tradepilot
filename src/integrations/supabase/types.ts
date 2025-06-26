export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action: string
          admin_username: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_username: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_username?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      admin_message_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          message_type: Database["public"]["Enums"]["admin_message_type"]
          subject: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message_type: Database["public"]["Enums"]["admin_message_type"]
          subject: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message_type?: Database["public"]["Enums"]["admin_message_type"]
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          password_hash: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash?: string
          username?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          confirmed_at: string | null
          created_at: string | null
          crypto_type: Database["public"]["Enums"]["crypto_type"]
          id: string
          status: Database["public"]["Enums"]["deposit_status"] | null
          transaction_hash: string | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount: number
          confirmed_at?: string | null
          created_at?: string | null
          crypto_type: Database["public"]["Enums"]["crypto_type"]
          id?: string
          status?: Database["public"]["Enums"]["deposit_status"] | null
          transaction_hash?: string | null
          user_id: string
          wallet_address: string
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          created_at?: string | null
          crypto_type?: Database["public"]["Enums"]["crypto_type"]
          id?: string
          status?: Database["public"]["Enums"]["deposit_status"] | null
          transaction_hash?: string | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_logos: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string
          name?: string
        }
        Relationships: []
      }
      investment_plans: {
        Row: {
          created_at: string | null
          daily_profit_percentage: number | null
          description: string | null
          duration_days: number
          id: string
          max_amount: number
          min_amount: number
          name: string
          profit_percentage: number
          status: Database["public"]["Enums"]["plan_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_profit_percentage?: number | null
          description?: string | null
          duration_days: number
          id?: string
          max_amount: number
          min_amount: number
          name: string
          profit_percentage: number
          status?: Database["public"]["Enums"]["plan_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_profit_percentage?: number | null
          description?: string | null
          duration_days?: number
          id?: string
          max_amount?: number
          min_amount?: number
          name?: string
          profit_percentage?: number
          status?: Database["public"]["Enums"]["plan_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          subject: string
          type: Database["public"]["Enums"]["message_type"]
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          subject: string
          type: Database["public"]["Enums"]["message_type"]
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          subject?: string
          type?: Database["public"]["Enums"]["message_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_exchange_logos: {
        Row: {
          created_at: string | null
          exchange_logo_id: string
          id: string
          plan_id: string
        }
        Insert: {
          created_at?: string | null
          exchange_logo_id: string
          id?: string
          plan_id: string
        }
        Update: {
          created_at?: string | null
          exchange_logo_id?: string
          id?: string
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_exchange_logos_exchange_logo_id_fkey"
            columns: ["exchange_logo_id"]
            isOneToOne: false
            referencedRelation: "exchange_logos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_exchange_logos_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "investment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          balance: number | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          referral_code: string
          referral_earnings: number | null
          referred_by: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          referral_code: string
          referral_earnings?: number | null
          referred_by?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          referral_code?: string
          referral_earnings?: number | null
          referred_by?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recaptcha_settings: {
        Row: {
          id: string
          is_enabled: boolean | null
          secret_key: string | null
          site_key: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          is_enabled?: boolean | null
          secret_key?: string | null
          site_key?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          is_enabled?: boolean | null
          secret_key?: string | null
          site_key?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      referral_earnings: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          referred_id: string
          referrer_id: string
          source: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          referred_id: string
          referrer_id: string
          source: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          referred_id?: string
          referrer_id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_earnings_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_earnings_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          assigned_admin_id: string | null
          created_at: string | null
          id: string
          message: string
          priority: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"] | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          assigned_admin_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          priority?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          assigned_admin_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      user_investments: {
        Row: {
          amount: number
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          plan_id: string
          profit_earned: number | null
          start_date: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          plan_id: string
          profit_earned?: number | null
          start_date?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          plan_id?: string
          profit_earned?: number | null
          start_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_investments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "investment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_investments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_addresses: {
        Row: {
          address: string
          created_at: string | null
          crypto_type: Database["public"]["Enums"]["crypto_type"]
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          crypto_type: Database["public"]["Enums"]["crypto_type"]
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          crypto_type?: Database["public"]["Enums"]["crypto_type"]
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string | null
          crypto_type: Database["public"]["Enums"]["crypto_type"]
          destination_address: string
          id: string
          processed_at: string | null
          status: Database["public"]["Enums"]["withdrawal_status"] | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string | null
          crypto_type: Database["public"]["Enums"]["crypto_type"]
          destination_address: string
          id?: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string | null
          crypto_type?: Database["public"]["Enums"]["crypto_type"]
          destination_address?: string
          id?: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      credit_daily_profits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      log_admin_activity: {
        Args: {
          p_admin_username: string
          p_action: string
          p_target_type?: string
          p_target_id?: string
          p_details?: Json
          p_ip_address?: unknown
        }
        Returns: string
      }
      process_deposit: {
        Args: { p_deposit_id: string; p_action: string; p_admin_notes?: string }
        Returns: boolean
      }
      process_withdrawal: {
        Args: {
          p_withdrawal_id: string
          p_action: string
          p_admin_notes?: string
        }
        Returns: boolean
      }
      send_user_notification: {
        Args: {
          p_user_id: string
          p_title: string
          p_message: string
          p_type?: string
        }
        Returns: string
      }
      update_user_balance: {
        Args: { p_user_id: string; p_amount: number; p_operation: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_message_type: "registration" | "withdrawal" | "deposit" | "general"
      crypto_type: "BTC" | "ETH" | "USDT"
      deposit_status: "pending" | "confirmed" | "failed"
      message_status: "unread" | "read"
      message_type: "system" | "admin" | "support"
      plan_status: "active" | "inactive"
      ticket_status: "open" | "replied" | "closed"
      withdrawal_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_message_type: ["registration", "withdrawal", "deposit", "general"],
      crypto_type: ["BTC", "ETH", "USDT"],
      deposit_status: ["pending", "confirmed", "failed"],
      message_status: ["unread", "read"],
      message_type: ["system", "admin", "support"],
      plan_status: ["active", "inactive"],
      ticket_status: ["open", "replied", "closed"],
      withdrawal_status: ["pending", "approved", "rejected"],
    },
  },
} as const

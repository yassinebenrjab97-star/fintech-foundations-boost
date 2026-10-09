export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author: string
          author_image: string | null
          category: string
          content: string | null
          created_at: string
          date: string
          id: string
          image: string
          read_time: string
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          author_image?: string | null
          category: string
          content?: string | null
          created_at?: string
          date: string
          id?: string
          image: string
          read_time: string
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          author_image?: string | null
          category?: string
          content?: string | null
          created_at?: string
          date?: string
          id?: string
          image?: string
          read_time?: string
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          equipment: Database["public"]["Enums"]["equipment_type"]
          id: string
          name: string
          sort: number
        }
        Insert: {
          equipment: Database["public"]["Enums"]["equipment_type"]
          id?: string
          name: string
          sort?: number
        }
        Update: {
          equipment?: Database["public"]["Enums"]["equipment_type"]
          id?: string
          name?: string
          sort?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reformed_equipment: {
        Row: {
          brand: string | null
          created_at: string
          equipment: string
          fault: string | null
          id: string
          reformed_at: string
          remarks: string | null
          request_id: string | null
          serial: string | null
          service: string
          ticket: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string
          equipment: string
          fault?: string | null
          id?: string
          reformed_at?: string
          remarks?: string | null
          request_id?: string | null
          serial?: string | null
          service: string
          ticket?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string
          equipment?: string
          fault?: string | null
          id?: string
          reformed_at?: string
          remarks?: string | null
          request_id?: string | null
          serial?: string | null
          service?: string
          ticket?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reformed_equipment_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_status_history: {
        Row: {
          created_at: string
          id: string
          note: string | null
          request_id: string
          status: Database["public"]["Enums"]["request_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          request_id: string
          status: Database["public"]["Enums"]["request_status"]
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          request_id?: string
          status?: Database["public"]["Enums"]["request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "request_status_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          availability: string | null
          brand: string
          created_at: string
          description: string
          email: string | null
          equipment: Database["public"]["Enums"]["equipment_type"]
          id: string
          internal_notes: string | null
          location: string
          phone: string
          photo_path: string | null
          refusal_reason: string | null
          reporter_name: string
          reporter_role: string | null
          serial: string | null
          service: string
          status: Database["public"]["Enums"]["request_status"]
          ticket: string
          updated_at: string
          urgency: string
        }
        Insert: {
          availability?: string | null
          brand: string
          created_at?: string
          description: string
          email?: string | null
          equipment: Database["public"]["Enums"]["equipment_type"]
          id?: string
          internal_notes?: string | null
          location: string
          phone: string
          photo_path?: string | null
          refusal_reason?: string | null
          reporter_name: string
          reporter_role?: string | null
          serial?: string | null
          service: string
          status?: Database["public"]["Enums"]["request_status"]
          ticket?: string
          updated_at?: string
          urgency?: string
        }
        Update: {
          availability?: string | null
          brand?: string
          created_at?: string
          description?: string
          email?: string | null
          equipment?: Database["public"]["Enums"]["equipment_type"]
          id?: string
          internal_notes?: string | null
          location?: string
          phone?: string
          photo_path?: string | null
          refusal_reason?: string | null
          reporter_name?: string
          reporter_role?: string | null
          serial?: string | null
          service?: string
          status?: Database["public"]["Enums"]["request_status"]
          ticket?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          id: string
          name: string
          sort: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort?: number
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value?: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      ticket_counters: {
        Row: {
          last: number
          year: number
        }
        Insert: {
          last?: number
          year: number
        }
        Update: {
          last?: number
          year?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      submit_request: { Args: { payload: Json }; Returns: string }
      track_request: {
        Args: { _phone?: string; _ticket: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
      equipment_type: "printer" | "monitor" | "pc" | "qr_printer"
      request_status:
        | "pending"
        | "refused"
        | "accepted"
        | "awaiting_repair"
        | "in_repair"
        | "repaired"
        | "unrepairable"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      equipment_type: ["printer", "monitor", "pc", "qr_printer"],
      request_status: [
        "pending",
        "refused",
        "accepted",
        "awaiting_repair",
        "in_repair",
        "repaired",
        "unrepairable",
      ],
    },
  },
} as const

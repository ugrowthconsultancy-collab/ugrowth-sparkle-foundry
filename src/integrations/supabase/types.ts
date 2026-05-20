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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          notes: string | null
          updated_at: string
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          notes?: string | null
          updated_at?: string
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      archetypes: {
        Row: {
          code: string
          created_at: string
          description_en: string
          description_hi: string
          label_en: string
          label_hi: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description_en: string
          description_hi: string
          label_en: string
          label_hi: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description_en?: string
          description_hi?: string
          label_en?: string
          label_hi?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      campaign_tracking: {
        Row: {
          created_at: string
          event_name: string
          event_payload: Json
          id: string
          landing_page: string
          profile_id: string | null
          referrer_url: string | null
          session_id: string
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          event_payload?: Json
          id?: string
          landing_page: string
          profile_id?: string | null
          referrer_url?: string | null
          session_id: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          event_payload?: Json
          id?: string
          landing_page?: string
          profile_id?: string | null
          referrer_url?: string | null
          session_id?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_tracking_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_resources: {
        Row: {
          audience_tags: string[]
          body_markdown: string | null
          business_stage: Database["public"]["Enums"]["business_stage"]
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          download_count: number
          id: string
          is_featured: boolean
          is_published: boolean
          language: Database["public"]["Enums"]["language_code"]
          pdf_url: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          thumbnail_url: string | null
          title: string
          topic_tags: string[]
          updated_at: string
        }
        Insert: {
          audience_tags?: string[]
          body_markdown?: string | null
          business_stage?: Database["public"]["Enums"]["business_stage"]
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string
          download_count?: number
          id?: string
          is_featured?: boolean
          is_published?: boolean
          language?: Database["public"]["Enums"]["language_code"]
          pdf_url?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          thumbnail_url?: string | null
          title: string
          topic_tags?: string[]
          updated_at?: string
        }
        Update: {
          audience_tags?: string[]
          body_markdown?: string | null
          business_stage?: Database["public"]["Enums"]["business_stage"]
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          download_count?: number
          id?: string
          is_featured?: boolean
          is_published?: boolean
          language?: Database["public"]["Enums"]["language_code"]
          pdf_url?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          thumbnail_url?: string | null
          title?: string
          topic_tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          business_age_months: number | null
          business_name: string | null
          city: string | null
          consent_dpdp: boolean
          consent_marketing: boolean
          created_at: string
          current_role: Database["public"]["Enums"]["user_current_role"] | null
          full_name: string | null
          grievance_officer_acknowledged: boolean
          id: string
          industry: string | null
          is_admin: boolean
          language_preference: Database["public"]["Enums"]["language_code"]
          linkedin_url: string | null
          monthly_revenue_range:
            | Database["public"]["Enums"]["revenue_range"]
            | null
          phone_e164: string | null
          pincode: string | null
          preferred_name: string | null
          state: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          business_age_months?: number | null
          business_name?: string | null
          city?: string | null
          consent_dpdp?: boolean
          consent_marketing?: boolean
          created_at?: string
          current_role?: Database["public"]["Enums"]["user_current_role"] | null
          full_name?: string | null
          grievance_officer_acknowledged?: boolean
          id: string
          industry?: string | null
          is_admin?: boolean
          language_preference?: Database["public"]["Enums"]["language_code"]
          linkedin_url?: string | null
          monthly_revenue_range?:
            | Database["public"]["Enums"]["revenue_range"]
            | null
          phone_e164?: string | null
          pincode?: string | null
          preferred_name?: string | null
          state?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          business_age_months?: number | null
          business_name?: string | null
          city?: string | null
          consent_dpdp?: boolean
          consent_marketing?: boolean
          created_at?: string
          current_role?: Database["public"]["Enums"]["user_current_role"] | null
          full_name?: string | null
          grievance_officer_acknowledged?: boolean
          id?: string
          industry?: string | null
          is_admin?: boolean
          language_preference?: Database["public"]["Enums"]["language_code"]
          linkedin_url?: string | null
          monthly_revenue_range?:
            | Database["public"]["Enums"]["revenue_range"]
            | null
          phone_e164?: string | null
          pincode?: string | null
          preferred_name?: string | null
          state?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          customer_city: string | null
          customer_designation: string | null
          customer_name: string
          customer_photo_url: string | null
          id: string
          is_featured: boolean
          language: Database["public"]["Enums"]["language_code"]
          permission_to_publish: boolean
          product_used: string | null
          profile_id: string | null
          star_rating: number | null
          testimonial_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_city?: string | null
          customer_designation?: string | null
          customer_name: string
          customer_photo_url?: string | null
          id?: string
          is_featured?: boolean
          language?: Database["public"]["Enums"]["language_code"]
          permission_to_publish?: boolean
          product_used?: string | null
          profile_id?: string | null
          star_rating?: number | null
          testimonial_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_city?: string | null
          customer_designation?: string | null
          customer_name?: string
          customer_photo_url?: string | null
          id?: string
          is_featured?: boolean
          language?: Database["public"]["Enums"]["language_code"]
          permission_to_publish?: boolean
          product_used?: string | null
          profile_id?: string | null
          star_rating?: number | null
          testimonial_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tools_outputs: {
        Row: {
          created_at: string
          email: string | null
          id: string
          input_data: Json
          output_data: Json
          pdf_url: string | null
          profile_id: string | null
          shared_to_email: string | null
          tool_name: Database["public"]["Enums"]["tool_name"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          input_data: Json
          output_data: Json
          pdf_url?: string | null
          profile_id?: string | null
          shared_to_email?: string | null
          tool_name: Database["public"]["Enums"]["tool_name"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          input_data?: Json
          output_data?: Json
          pdf_url?: string | null
          profile_id?: string | null
          shared_to_email?: string | null
          tool_name?: Database["public"]["Enums"]["tool_name"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tools_outputs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlists: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          notes: string | null
          priority: number
          product_interested_in: string
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          notes?: string | null
          priority?: number
          product_interested_in: string
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          notes?: string | null
          priority?: number
          product_interested_in?: string
          profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlists_profile_id_fkey"
            columns: ["profile_id"]
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      business_stage: "plan_start" | "manage_grow" | "scale_exit" | "all"
      content_type:
        | "article"
        | "framework_pdf"
        | "template"
        | "checklist"
        | "video"
        | "podcast"
      language_code: "en" | "hi"
      revenue_range: "0" | "0-25k" | "25k-1L" | "1L-5L" | "5L-25L" | "25L+"
      tool_name:
        | "niche_generator"
        | "rate_card_builder"
        | "gst_checker"
        | "compliance_calendar"
        | "working_capital_calc"
        | "founder_vital_signs"
        | "pricing_calculator"
        | "should_i_switch"
      user_current_role:
        | "salaried"
        | "side_hustling"
        | "returning_homemaker"
        | "first_gen_consultant"
        | "tier2_dreamer"
        | "fully_independent"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      business_stage: ["plan_start", "manage_grow", "scale_exit", "all"],
      content_type: [
        "article",
        "framework_pdf",
        "template",
        "checklist",
        "video",
        "podcast",
      ],
      language_code: ["en", "hi"],
      revenue_range: ["0", "0-25k", "25k-1L", "1L-5L", "5L-25L", "25L+"],
      tool_name: [
        "niche_generator",
        "rate_card_builder",
        "gst_checker",
        "compliance_calendar",
        "working_capital_calc",
        "founder_vital_signs",
        "pricing_calculator",
        "should_i_switch",
      ],
      user_current_role: [
        "salaried",
        "side_hustling",
        "returning_homemaker",
        "first_gen_consultant",
        "tier2_dreamer",
        "fully_independent",
      ],
    },
  },
} as const

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
      ai_conversations: {
        Row: {
          anon_id: string | null
          archetype_detected: string | null
          created_at: string
          id: string
          is_archived: boolean
          last_message_at: string
          message_count: number
          profile_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          anon_id?: string | null
          archetype_detected?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean
          last_message_at?: string
          message_count?: number
          profile_id?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          anon_id?: string | null
          archetype_detected?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean
          last_message_at?: string
          message_count?: number
          profile_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          model_used: Database["public"]["Enums"]["ai_model_used"] | null
          role: Database["public"]["Enums"]["ai_message_role"]
          token_count: number | null
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          model_used?: Database["public"]["Enums"]["ai_model_used"] | null
          role: Database["public"]["Enums"]["ai_message_role"]
          token_count?: number | null
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          model_used?: Database["public"]["Enums"]["ai_model_used"] | null
          role?: Database["public"]["Enums"]["ai_message_role"]
          token_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_daily: {
        Row: {
          created_at: string
          id: string
          messages_count: number
          profile_id: string
          tier: Database["public"]["Enums"]["ai_tier"]
          tokens_used: number
          updated_at: string
          usage_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages_count?: number
          profile_id: string
          tier?: Database["public"]["Enums"]["ai_tier"]
          tokens_used?: number
          updated_at?: string
          usage_date: string
        }
        Update: {
          created_at?: string
          id?: string
          messages_count?: number
          profile_id?: string
          tier?: Database["public"]["Enums"]["ai_tier"]
          tokens_used?: number
          updated_at?: string
          usage_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_daily_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      cohort_applications: {
        Row: {
          ai_pre_screen_notes: string | null
          ai_pre_screen_score: number | null
          application_data: Json
          captain_notes: string | null
          cohort_id: string
          created_at: string
          enrolled_at: string | null
          id: string
          payment_link: string | null
          payment_status: Database["public"]["Enums"]["cohort_payment_status"]
          profile_id: string
          screening_status: Database["public"]["Enums"]["cohort_screening_status"]
          updated_at: string
        }
        Insert: {
          ai_pre_screen_notes?: string | null
          ai_pre_screen_score?: number | null
          application_data: Json
          captain_notes?: string | null
          cohort_id: string
          created_at?: string
          enrolled_at?: string | null
          id?: string
          payment_link?: string | null
          payment_status?: Database["public"]["Enums"]["cohort_payment_status"]
          profile_id: string
          screening_status?: Database["public"]["Enums"]["cohort_screening_status"]
          updated_at?: string
        }
        Update: {
          ai_pre_screen_notes?: string | null
          ai_pre_screen_score?: number | null
          application_data?: Json
          captain_notes?: string | null
          cohort_id?: string
          created_at?: string
          enrolled_at?: string | null
          id?: string
          payment_link?: string | null
          payment_status?: Database["public"]["Enums"]["cohort_payment_status"]
          profile_id?: string
          screening_status?: Database["public"]["Enums"]["cohort_screening_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_applications_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohort_applications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          application_deadline: string
          captain_led: boolean
          created_at: string
          curriculum_url: string | null
          description: string | null
          end_date: string
          id: string
          instructor_partner_id: string | null
          is_open: boolean
          max_seats: number
          name: string
          price_inr_paise: number
          product_type: Database["public"]["Enums"]["cohort_product_type"]
          start_date: string
          updated_at: string
        }
        Insert: {
          application_deadline: string
          captain_led?: boolean
          created_at?: string
          curriculum_url?: string | null
          description?: string | null
          end_date: string
          id?: string
          instructor_partner_id?: string | null
          is_open?: boolean
          max_seats?: number
          name: string
          price_inr_paise: number
          product_type: Database["public"]["Enums"]["cohort_product_type"]
          start_date: string
          updated_at?: string
        }
        Update: {
          application_deadline?: string
          captain_led?: boolean
          created_at?: string
          curriculum_url?: string | null
          description?: string | null
          end_date?: string
          id?: string
          instructor_partner_id?: string | null
          is_open?: boolean
          max_seats?: number
          name?: string
          price_inr_paise?: number
          product_type?: Database["public"]["Enums"]["cohort_product_type"]
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohorts_instructor_partner_id_fkey"
            columns: ["instructor_partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohorts_instructor_partner_id_fkey"
            columns: ["instructor_partner_id"]
            isOneToOne: false
            referencedRelation: "partners_public"
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
      partners: {
        Row: {
          agreement_signed_date: string | null
          bank_account_for_payouts: Json
          city: string
          commission_split_pct: number
          created_at: string
          email: string
          id: string
          internal_notes: string | null
          is_active: boolean
          name: string
          partner_type: Database["public"]["Enums"]["partner_type"]
          phone_e164: string | null
          service_capacity: Json
          specialisations: string[]
          state: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          agreement_signed_date?: string | null
          bank_account_for_payouts?: Json
          city: string
          commission_split_pct?: number
          created_at?: string
          email: string
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          name: string
          partner_type: Database["public"]["Enums"]["partner_type"]
          phone_e164?: string | null
          service_capacity?: Json
          specialisations?: string[]
          state?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          agreement_signed_date?: string | null
          bank_account_for_payouts?: Json
          city?: string
          commission_split_pct?: number
          created_at?: string
          email?: string
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          name?: string
          partner_type?: Database["public"]["Enums"]["partner_type"]
          phone_e164?: string | null
          service_capacity?: Json
          specialisations?: string[]
          state?: string | null
          updated_at?: string
          whatsapp_number?: string | null
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
      service_orders: {
        Row: {
          amount_inr_paise: number
          completed_at: string | null
          created_at: string
          customer_documents: Json
          id: string
          intake_data: Json
          notes: string | null
          order_id_human: string | null
          partner_ca_id: string | null
          profile_id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status: Database["public"]["Enums"]["service_order_status"]
          updated_at: string
        }
        Insert: {
          amount_inr_paise: number
          completed_at?: string | null
          created_at?: string
          customer_documents?: Json
          id?: string
          intake_data?: Json
          notes?: string | null
          order_id_human?: string | null
          partner_ca_id?: string | null
          profile_id: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["service_order_status"]
          updated_at?: string
        }
        Update: {
          amount_inr_paise?: number
          completed_at?: string | null
          created_at?: string
          customer_documents?: Json
          id?: string
          intake_data?: Json
          notes?: string | null
          order_id_human?: string | null
          partner_ca_id?: string | null
          profile_id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["service_order_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_partner_ca_id_fkey"
            columns: ["partner_ca_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_partner_ca_id_fkey"
            columns: ["partner_ca_id"]
            isOneToOne: false
            referencedRelation: "partners_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount_inr_paise: number
          billing_cycle: Database["public"]["Enums"]["subscription_billing_cycle"]
          cancelled_at: string | null
          created_at: string
          id: string
          next_billing_date: string | null
          product: Database["public"]["Enums"]["subscription_product"]
          profile_id: string
          razorpay_subscription_id: string | null
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
        }
        Insert: {
          amount_inr_paise: number
          billing_cycle: Database["public"]["Enums"]["subscription_billing_cycle"]
          cancelled_at?: string | null
          created_at?: string
          id?: string
          next_billing_date?: string | null
          product: Database["public"]["Enums"]["subscription_product"]
          profile_id: string
          razorpay_subscription_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Update: {
          amount_inr_paise?: number
          billing_cycle?: Database["public"]["Enums"]["subscription_billing_cycle"]
          cancelled_at?: string | null
          created_at?: string
          id?: string
          next_billing_date?: string | null
          product?: Database["public"]["Enums"]["subscription_product"]
          profile_id?: string
          razorpay_subscription_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      partners_public: {
        Row: {
          city: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          partner_type: Database["public"]["Enums"]["partner_type"] | null
          specialisations: string[] | null
          state: string | null
        }
        Insert: {
          city?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          partner_type?: Database["public"]["Enums"]["partner_type"] | null
          specialisations?: string[] | null
          state?: string | null
        }
        Update: {
          city?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          partner_type?: Database["public"]["Enums"]["partner_type"] | null
          specialisations?: string[] | null
          state?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_ai_usage_today: {
        Args: { p_profile_id: string }
        Returns: number
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      ai_message_role: "user" | "assistant"
      ai_model_used: "haiku" | "sonnet"
      ai_tier: "free" | "pro"
      business_stage: "plan_start" | "manage_grow" | "scale_exit" | "all"
      cohort_payment_status: "not_sent" | "sent" | "paid" | "expired"
      cohort_product_type:
        | "mepsc_certification"
        | "return_to_work"
        | "pricing_workshop"
        | "mastermind"
      cohort_screening_status:
        | "pending"
        | "shortlisted"
        | "accepted"
        | "rejected"
        | "waitlisted"
      content_type:
        | "article"
        | "framework_pdf"
        | "template"
        | "checklist"
        | "video"
        | "podcast"
      language_code: "en" | "hi"
      partner_type:
        | "ca"
        | "advocate"
        | "mentor"
        | "workshop_speaker"
        | "cohort_lead"
      revenue_range: "0" | "0-25k" | "25k-1L" | "1L-5L" | "5L-25L" | "25L+"
      service_order_status:
        | "created"
        | "paid"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "refunded"
      service_type:
        | "gst_registration"
        | "udyam"
        | "pvt_ltd_incorporation"
        | "llp_incorporation"
        | "roc_annual_filing"
        | "epf_setup"
        | "trademark_filing"
        | "fssai"
        | "compliance_subscription"
      subscription_billing_cycle: "monthly" | "annual"
      subscription_product:
        | "ai_pro"
        | "alumni_community"
        | "compliance"
        | "circle_membership"
      subscription_status:
        | "active"
        | "paused"
        | "cancelled"
        | "past_due"
        | "trialing"
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
      ai_message_role: ["user", "assistant"],
      ai_model_used: ["haiku", "sonnet"],
      ai_tier: ["free", "pro"],
      business_stage: ["plan_start", "manage_grow", "scale_exit", "all"],
      cohort_payment_status: ["not_sent", "sent", "paid", "expired"],
      cohort_product_type: [
        "mepsc_certification",
        "return_to_work",
        "pricing_workshop",
        "mastermind",
      ],
      cohort_screening_status: [
        "pending",
        "shortlisted",
        "accepted",
        "rejected",
        "waitlisted",
      ],
      content_type: [
        "article",
        "framework_pdf",
        "template",
        "checklist",
        "video",
        "podcast",
      ],
      language_code: ["en", "hi"],
      partner_type: [
        "ca",
        "advocate",
        "mentor",
        "workshop_speaker",
        "cohort_lead",
      ],
      revenue_range: ["0", "0-25k", "25k-1L", "1L-5L", "5L-25L", "25L+"],
      service_order_status: [
        "created",
        "paid",
        "in_progress",
        "completed",
        "cancelled",
        "refunded",
      ],
      service_type: [
        "gst_registration",
        "udyam",
        "pvt_ltd_incorporation",
        "llp_incorporation",
        "roc_annual_filing",
        "epf_setup",
        "trademark_filing",
        "fssai",
        "compliance_subscription",
      ],
      subscription_billing_cycle: ["monthly", "annual"],
      subscription_product: [
        "ai_pro",
        "alumni_community",
        "compliance",
        "circle_membership",
      ],
      subscription_status: [
        "active",
        "paused",
        "cancelled",
        "past_due",
        "trialing",
      ],
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

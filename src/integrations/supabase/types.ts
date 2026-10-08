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
      activity_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
        }
        Relationships: []
      }
      affiliate_clicks: {
        Row: {
          affiliate_id: string
          created_at: string
          ebook_id: string | null
          id: string
          ip_address: string | null
          landing_path: string | null
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          affiliate_id: string
          created_at?: string
          ebook_id?: string | null
          id?: string
          ip_address?: string | null
          landing_path?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          affiliate_id?: string
          created_at?: string
          ebook_id?: string | null
          id?: string
          ip_address?: string | null
          landing_path?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_conversions: {
        Row: {
          affiliate_id: string
          amount_usd: number
          commission_usd: number
          created_at: string
          ebook_id: string | null
          email: string | null
          external_order_id: string | null
          id: string
          status: string
          user_id: string | null
        }
        Insert: {
          affiliate_id: string
          amount_usd?: number
          commission_usd?: number
          created_at?: string
          ebook_id?: string | null
          email?: string | null
          external_order_id?: string | null
          id?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          affiliate_id?: string
          amount_usd?: number
          commission_usd?: number
          created_at?: string
          ebook_id?: string | null
          email?: string | null
          external_order_id?: string | null
          id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_conversions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          active: boolean
          code: string
          commission_percent: number
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          total_clicks: number
          total_conversions: number
          total_revenue_usd: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          commission_percent?: number
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          total_clicks?: number
          total_conversions?: number
          total_revenue_usd?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          commission_percent?: number
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          total_clicks?: number
          total_conversions?: number
          total_revenue_usd?: number
          updated_at?: string
        }
        Relationships: []
      }
      collection_items: {
        Row: {
          collection_id: string
          ebook_id: string
          id: string
          sort_order: number
        }
        Insert: {
          collection_id: string
          ebook_id: string
          id?: string
          sort_order?: number
        }
        Update: {
          collection_id?: string
          ebook_id?: string
          id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "ebook_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_redemptions: {
        Row: {
          amount_discounted: number | null
          coupon_id: string
          created_at: string
          ebook_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          amount_discounted?: number | null
          coupon_id: string
          created_at?: string
          ebook_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          amount_discounted?: number | null
          coupon_id?: string
          created_at?: string
          ebook_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          discount_type: Database["public"]["Enums"]["coupon_type"]
          discount_value: number
          expires_at: string | null
          id: string
          max_uses: number | null
          min_order_usd: number | null
          scope: Database["public"]["Enums"]["coupon_scope"]
          scope_category: string | null
          scope_ebook_id: string | null
          starts_at: string | null
          updated_at: string
          used_count: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["coupon_type"]
          discount_value: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_order_usd?: number | null
          scope?: Database["public"]["Enums"]["coupon_scope"]
          scope_category?: string | null
          scope_ebook_id?: string | null
          starts_at?: string | null
          updated_at?: string
          used_count?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["coupon_type"]
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_order_usd?: number | null
          scope?: Database["public"]["Enums"]["coupon_scope"]
          scope_category?: string | null
          scope_ebook_id?: string | null
          starts_at?: string | null
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      downloads: {
        Row: {
          downloaded_at: string
          ebook_id: string
          id: string
          user_id: string
        }
        Insert: {
          downloaded_at?: string
          ebook_id: string
          id?: string
          user_id: string
        }
        Update: {
          downloaded_at?: string
          ebook_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "downloads_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      ebook_bonuses: {
        Row: {
          created_at: string
          description: string | null
          ebook_id: string
          file_path: string
          file_type: string | null
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ebook_id: string
          file_path: string
          file_type?: string | null
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ebook_id?: string
          file_path?: string
          file_type?: string | null
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ebook_bonuses_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      ebook_chapters: {
        Row: {
          audio_timestamp_seconds: number | null
          created_at: string
          description: string | null
          ebook_id: string
          id: string
          is_free_preview: boolean
          page_start: number | null
          sort_order: number
          title: string
        }
        Insert: {
          audio_timestamp_seconds?: number | null
          created_at?: string
          description?: string | null
          ebook_id: string
          id?: string
          is_free_preview?: boolean
          page_start?: number | null
          sort_order?: number
          title: string
        }
        Update: {
          audio_timestamp_seconds?: number | null
          created_at?: string
          description?: string | null
          ebook_id?: string
          id?: string
          is_free_preview?: boolean
          page_start?: number | null
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      ebook_collections: {
        Row: {
          bundle_price_mzn: number | null
          bundle_price_usd: number | null
          cover_url: string | null
          created_at: string
          description: string | null
          featured: boolean
          id: string
          published: boolean
          slug: string
          sort_order: number
          title: string
          type: Database["public"]["Enums"]["collection_type"]
          updated_at: string
        }
        Insert: {
          bundle_price_mzn?: number | null
          bundle_price_usd?: number | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          published?: boolean
          slug: string
          sort_order?: number
          title: string
          type?: Database["public"]["Enums"]["collection_type"]
          updated_at?: string
        }
        Update: {
          bundle_price_mzn?: number | null
          bundle_price_usd?: number | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          published?: boolean
          slug?: string
          sort_order?: number
          title?: string
          type?: Database["public"]["Enums"]["collection_type"]
          updated_at?: string
        }
        Relationships: []
      }
      ebook_reviews: {
        Row: {
          approved: boolean
          body: string | null
          created_at: string
          ebook_id: string
          hidden: boolean
          id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved?: boolean
          body?: string | null
          created_at?: string
          ebook_id: string
          hidden?: boolean
          id?: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved?: boolean
          body?: string | null
          created_at?: string
          ebook_id?: string
          hidden?: boolean
          id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ebooks: {
        Row: {
          allow_download: boolean
          audio_duration_seconds: number | null
          audio_path_en: string | null
          audio_path_pt: string | null
          author: string | null
          author_avatar_url: string | null
          author_bio: string | null
          author_social_links: Json
          available_formats: string[]
          available_languages: string[]
          category: Database["public"]["Enums"]["ebook_category"]
          checkout_url: string | null
          countdown_enabled: boolean
          countdown_text: string | null
          cover_bg_color: string | null
          cover_gradient: string | null
          cover_text_color: string | null
          cover_text_subtitle: string | null
          cover_text_title: string | null
          cover_type: Database["public"]["Enums"]["cover_type"]
          cover_url: string | null
          created_at: string
          description: string | null
          download_button_text: string | null
          download_expires_at: string | null
          featured: boolean
          free_until: string | null
          id: string
          isbn: string | null
          language: string | null
          lemon_squeezy_variant_id: string | null
          narrator: string | null
          original_type: Database["public"]["Enums"]["ebook_type"] | null
          pages: number | null
          pdf_path: string | null
          pdf_path_en: string | null
          pdf_path_pt: string | null
          preview_audio_path: string | null
          preview_pdf_path: string | null
          price_mzn: number | null
          price_usd: number | null
          publication_year: number | null
          published: boolean
          published_at: string | null
          publisher: string | null
          sale_ends_at: string | null
          sale_price_mzn: number | null
          sale_price_usd: number | null
          sale_starts_at: string | null
          scheduled_at: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["ebook_status"]
          tags: string[]
          title: string
          type: Database["public"]["Enums"]["ebook_type"]
          updated_at: string
        }
        Insert: {
          allow_download?: boolean
          audio_duration_seconds?: number | null
          audio_path_en?: string | null
          audio_path_pt?: string | null
          author?: string | null
          author_avatar_url?: string | null
          author_bio?: string | null
          author_social_links?: Json
          available_formats?: string[]
          available_languages?: string[]
          category: Database["public"]["Enums"]["ebook_category"]
          checkout_url?: string | null
          countdown_enabled?: boolean
          countdown_text?: string | null
          cover_bg_color?: string | null
          cover_gradient?: string | null
          cover_text_color?: string | null
          cover_text_subtitle?: string | null
          cover_text_title?: string | null
          cover_type?: Database["public"]["Enums"]["cover_type"]
          cover_url?: string | null
          created_at?: string
          description?: string | null
          download_button_text?: string | null
          download_expires_at?: string | null
          featured?: boolean
          free_until?: string | null
          id?: string
          isbn?: string | null
          language?: string | null
          lemon_squeezy_variant_id?: string | null
          narrator?: string | null
          original_type?: Database["public"]["Enums"]["ebook_type"] | null
          pages?: number | null
          pdf_path?: string | null
          pdf_path_en?: string | null
          pdf_path_pt?: string | null
          preview_audio_path?: string | null
          preview_pdf_path?: string | null
          price_mzn?: number | null
          price_usd?: number | null
          publication_year?: number | null
          published?: boolean
          published_at?: string | null
          publisher?: string | null
          sale_ends_at?: string | null
          sale_price_mzn?: number | null
          sale_price_usd?: number | null
          sale_starts_at?: string | null
          scheduled_at?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["ebook_status"]
          tags?: string[]
          title: string
          type?: Database["public"]["Enums"]["ebook_type"]
          updated_at?: string
        }
        Update: {
          allow_download?: boolean
          audio_duration_seconds?: number | null
          audio_path_en?: string | null
          audio_path_pt?: string | null
          author?: string | null
          author_avatar_url?: string | null
          author_bio?: string | null
          author_social_links?: Json
          available_formats?: string[]
          available_languages?: string[]
          category?: Database["public"]["Enums"]["ebook_category"]
          checkout_url?: string | null
          countdown_enabled?: boolean
          countdown_text?: string | null
          cover_bg_color?: string | null
          cover_gradient?: string | null
          cover_text_color?: string | null
          cover_text_subtitle?: string | null
          cover_text_title?: string | null
          cover_type?: Database["public"]["Enums"]["cover_type"]
          cover_url?: string | null
          created_at?: string
          description?: string | null
          download_button_text?: string | null
          download_expires_at?: string | null
          featured?: boolean
          free_until?: string | null
          id?: string
          isbn?: string | null
          language?: string | null
          lemon_squeezy_variant_id?: string | null
          narrator?: string | null
          original_type?: Database["public"]["Enums"]["ebook_type"] | null
          pages?: number | null
          pdf_path?: string | null
          pdf_path_en?: string | null
          pdf_path_pt?: string | null
          preview_audio_path?: string | null
          preview_pdf_path?: string | null
          price_mzn?: number | null
          price_usd?: number | null
          publication_year?: number | null
          published?: boolean
          published_at?: string | null
          publisher?: string | null
          sale_ends_at?: string | null
          sale_price_mzn?: number | null
          sale_price_usd?: number | null
          sale_starts_at?: string | null
          scheduled_at?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["ebook_status"]
          tags?: string[]
          title?: string
          type?: Database["public"]["Enums"]["ebook_type"]
          updated_at?: string
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          body_html: string | null
          clicks_count: number
          created_at: string
          id: string
          name: string
          opens_count: number
          recipients_count: number
          scheduled_at: string | null
          segment: string
          sent_at: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          body_html?: string | null
          clicks_count?: number
          created_at?: string
          id?: string
          name: string
          opens_count?: number
          recipients_count?: number
          scheduled_at?: string | null
          segment?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          body_html?: string | null
          clicks_count?: number
          created_at?: string
          id?: string
          name?: string
          opens_count?: number
          recipients_count?: number
          scheduled_at?: string | null
          segment?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      home_sections: {
        Row: {
          config: Json
          created_at: string
          enabled: boolean
          id: string
          kind: Database["public"]["Enums"]["home_section_kind"]
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          kind: Database["public"]["Enums"]["home_section_kind"]
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          kind?: Database["public"]["Enums"]["home_section_kind"]
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mentor10k_access: {
        Row: {
          created_at: string
          email: string | null
          external_order_id: string | null
          granted_by: string | null
          id: string
          notes: string | null
          source: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          external_order_id?: string | null
          granted_by?: string | null
          id?: string
          notes?: string | null
          source?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          external_order_id?: string | null
          granted_by?: string | null
          id?: string
          notes?: string | null
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mentor10k_checkins: {
        Row: {
          created_at: string
          id: string
          income_eur: number | null
          mentor_feedback: string | null
          mood: string | null
          next_focus: string | null
          plan_id: string | null
          progress_score: number | null
          user_id: string
          week_number: number
          what_blocked: string | null
          what_done: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          income_eur?: number | null
          mentor_feedback?: string | null
          mood?: string | null
          next_focus?: string | null
          plan_id?: string | null
          progress_score?: number | null
          user_id: string
          week_number: number
          what_blocked?: string | null
          what_done?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          income_eur?: number | null
          mentor_feedback?: string | null
          mood?: string | null
          next_focus?: string | null
          plan_id?: string | null
          progress_score?: number | null
          user_id?: string
          week_number?: number
          what_blocked?: string | null
          what_done?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor10k_checkins_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "mentor10k_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor10k_diagnostics: {
        Row: {
          available_hours_week: number | null
          created_at: string
          current_situation: string
          deadline_months: number | null
          goal: string
          id: string
          monthly_income_eur: number | null
          obstacles: string | null
          profile_type: string | null
          raw_answers: Json | null
          resources: string | null
          skills: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_hours_week?: number | null
          created_at?: string
          current_situation: string
          deadline_months?: number | null
          goal: string
          id?: string
          monthly_income_eur?: number | null
          obstacles?: string | null
          profile_type?: string | null
          raw_answers?: Json | null
          resources?: string | null
          skills?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_hours_week?: number | null
          created_at?: string
          current_situation?: string
          deadline_months?: number | null
          goal?: string
          id?: string
          monthly_income_eur?: number | null
          obstacles?: string | null
          profile_type?: string | null
          raw_answers?: Json | null
          resources?: string | null
          skills?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentor10k_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      mentor10k_milestones: {
        Row: {
          achieved_at: string
          description: string | null
          id: string
          plan_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          achieved_at?: string
          description?: string | null
          id?: string
          plan_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          achieved_at?: string
          description?: string | null
          id?: string
          plan_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor10k_milestones_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "mentor10k_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor10k_plans: {
        Row: {
          admin_notes: string | null
          created_at: string
          diagnostic_id: string | null
          duration_weeks: number | null
          id: string
          kpis: Json | null
          model: string | null
          phases: Json
          status: string
          summary: string | null
          title: string
          updated_at: string
          user_id: string
          weekly_tasks: Json
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          diagnostic_id?: string | null
          duration_weeks?: number | null
          id?: string
          kpis?: Json | null
          model?: string | null
          phases?: Json
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
          user_id: string
          weekly_tasks?: Json
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          diagnostic_id?: string | null
          duration_weeks?: number | null
          id?: string
          kpis?: Json | null
          model?: string | null
          phases?: Json
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          weekly_tasks?: Json
        }
        Relationships: [
          {
            foreignKeyName: "mentor10k_plans_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "mentor10k_diagnostics"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read: boolean
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          read?: boolean
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read?: boolean
          title?: string
        }
        Relationships: []
      }
      popups: {
        Row: {
          body: string | null
          clicks_count: number
          created_at: string
          cta_link: string | null
          cta_text: string | null
          enabled: boolean
          ends_at: string | null
          id: string
          image_url: string | null
          name: string
          show_on_paths: string[]
          starts_at: string | null
          target: Database["public"]["Enums"]["popup_target"]
          title: string | null
          trigger: Database["public"]["Enums"]["popup_trigger"]
          trigger_value: number
          updated_at: string
          views_count: number
        }
        Insert: {
          body?: string | null
          clicks_count?: number
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          enabled?: boolean
          ends_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          show_on_paths?: string[]
          starts_at?: string | null
          target?: Database["public"]["Enums"]["popup_target"]
          title?: string | null
          trigger?: Database["public"]["Enums"]["popup_trigger"]
          trigger_value?: number
          updated_at?: string
          views_count?: number
        }
        Update: {
          body?: string | null
          clicks_count?: number
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          enabled?: boolean
          ends_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          show_on_paths?: string[]
          starts_at?: string | null
          target?: Database["public"]["Enums"]["popup_target"]
          title?: string | null
          trigger?: Database["public"]["Enums"]["popup_trigger"]
          trigger_value?: number
          updated_at?: string
          views_count?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          preferred_language: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          preferred_language?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          preferred_language?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount_paid: number
          created_at: string
          currency: string
          ebook_id: string
          id: string
          status: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          amount_paid: number
          created_at?: string
          currency?: string
          ebook_id: string
          id?: string
          status?: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          currency?: string
          ebook_id?: string
          id?: string
          status?: string
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          banner_enabled: boolean
          banner_link: string | null
          banner_text: string | null
          contact_email: string | null
          footer_text: string | null
          id: boolean
          logo_url: string | null
          mentor10k_checkout_url: string | null
          mentor10k_price_usd: number | null
          site_name: string
          social_facebook: string | null
          social_instagram: string | null
          social_linkedin: string | null
          social_tiktok: string | null
          social_whatsapp: string | null
          social_x: string | null
          social_youtube: string | null
          tagline: string | null
          updated_at: string
        }
        Insert: {
          banner_enabled?: boolean
          banner_link?: string | null
          banner_text?: string | null
          contact_email?: string | null
          footer_text?: string | null
          id?: boolean
          logo_url?: string | null
          mentor10k_checkout_url?: string | null
          mentor10k_price_usd?: number | null
          site_name?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_tiktok?: string | null
          social_whatsapp?: string | null
          social_x?: string | null
          social_youtube?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          banner_enabled?: boolean
          banner_link?: string | null
          banner_text?: string | null
          contact_email?: string | null
          footer_text?: string | null
          id?: boolean
          logo_url?: string | null
          mentor10k_checkout_url?: string | null
          mentor10k_price_usd?: number | null
          site_name?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_tiktok?: string | null
          social_whatsapp?: string | null
          social_x?: string | null
          social_youtube?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_bans: {
        Row: {
          banned_by: string | null
          banned_until: string | null
          created_at: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          banned_by?: string | null
          banned_until?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          banned_by?: string | null
          banned_until?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vault_access_grants: {
        Row: {
          created_at: string
          ebook_id: string
          email: string | null
          external_order_id: string | null
          granted_by: string | null
          id: string
          notes: string | null
          source: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          ebook_id: string
          email?: string | null
          external_order_id?: string | null
          granted_by?: string | null
          id?: string
          notes?: string | null
          source?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          ebook_id?: string
          email?: string | null
          external_order_id?: string | null
          granted_by?: string | null
          id?: string
          notes?: string | null
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_vault_access_for_email: { Args: never; Returns: undefined }
      has_ebook_access: {
        Args: { _ebook_id: string; _user_id: string }
        Returns: boolean
      }
      has_mentor10k_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      campaign_status: "draft" | "scheduled" | "sending" | "sent" | "failed"
      collection_type: "series" | "bundle" | "curated"
      coupon_scope: "all" | "ebook" | "category"
      coupon_type: "percent" | "fixed"
      cover_type: "image" | "text"
      ebook_category:
        | "marketing_negocios"
        | "educacao_estudo"
        | "desenvolvimento_pessoal"
      ebook_status: "draft" | "scheduled" | "published" | "archived"
      ebook_type: "free" | "premium"
      home_section_kind:
        | "hero"
        | "featured"
        | "category"
        | "collection"
        | "newsletter"
        | "testimonials"
        | "custom_html"
        | "stats"
      popup_target: "all" | "guests" | "authenticated"
      popup_trigger: "immediate" | "delay" | "scroll" | "exit_intent"
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
      campaign_status: ["draft", "scheduled", "sending", "sent", "failed"],
      collection_type: ["series", "bundle", "curated"],
      coupon_scope: ["all", "ebook", "category"],
      coupon_type: ["percent", "fixed"],
      cover_type: ["image", "text"],
      ebook_category: [
        "marketing_negocios",
        "educacao_estudo",
        "desenvolvimento_pessoal",
      ],
      ebook_status: ["draft", "scheduled", "published", "archived"],
      ebook_type: ["free", "premium"],
      home_section_kind: [
        "hero",
        "featured",
        "category",
        "collection",
        "newsletter",
        "testimonials",
        "custom_html",
        "stats",
      ],
      popup_target: ["all", "guests", "authenticated"],
      popup_trigger: ["immediate", "delay", "scroll", "exit_intent"],
    },
  },
} as const

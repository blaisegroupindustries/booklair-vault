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
      ebooks: {
        Row: {
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
          cover_bg_color: string | null
          cover_gradient: string | null
          cover_text_color: string | null
          cover_text_subtitle: string | null
          cover_text_title: string | null
          cover_type: Database["public"]["Enums"]["cover_type"]
          cover_url: string | null
          created_at: string
          description: string | null
          featured: boolean
          free_until: string | null
          id: string
          isbn: string | null
          language: string | null
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
          cover_bg_color?: string | null
          cover_gradient?: string | null
          cover_text_color?: string | null
          cover_text_subtitle?: string | null
          cover_text_title?: string | null
          cover_type?: Database["public"]["Enums"]["cover_type"]
          cover_url?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          free_until?: string | null
          id?: string
          isbn?: string | null
          language?: string | null
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
          cover_bg_color?: string | null
          cover_gradient?: string | null
          cover_text_color?: string | null
          cover_text_subtitle?: string | null
          cover_text_title?: string | null
          cover_type?: Database["public"]["Enums"]["cover_type"]
          cover_url?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          free_until?: string | null
          id?: string
          isbn?: string | null
          language?: string | null
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
    }
    Enums: {
      app_role: "admin" | "user"
      cover_type: "image" | "text"
      ebook_category:
        | "marketing_negocios"
        | "educacao_estudo"
        | "desenvolvimento_pessoal"
      ebook_status: "draft" | "scheduled" | "published" | "archived"
      ebook_type: "free" | "premium"
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
      app_role: ["admin", "user"],
      cover_type: ["image", "text"],
      ebook_category: [
        "marketing_negocios",
        "educacao_estudo",
        "desenvolvimento_pessoal",
      ],
      ebook_status: ["draft", "scheduled", "published", "archived"],
      ebook_type: ["free", "premium"],
    },
  },
} as const

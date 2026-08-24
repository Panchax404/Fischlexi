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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      difficulty_levels: {
        Row: {
          created_at: string
          description: string | null
          id: number
          level_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          level_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          level_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      feeding_categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      fish: {
        Row: {
          aquarium_min_edge_length_cm: number | null
          aquarium_min_liters: number | null
          author_notes: string | null
          created_at: string
          difficulty_level_id: number | null
          id: number
          image_gallery_urls: string[] | null
          image_url_main: string | null
          is_published: boolean
          latin_name: string | null
          lifespan_years_max: number | null
          lifespan_years_min: number | null
          primary_habitat_id: number | null
          size_cm_max: number | null
          size_cm_min: number | null
          taxonomy_id: number | null
          updated_at: string
          water_hardness_dh_max: number | null
          water_hardness_dh_min: number | null
          water_ph_max: number | null
          water_ph_min: number | null
          water_temperature_max_c: number | null
          water_temperature_min_c: number | null
        }
        Insert: {
          aquarium_min_edge_length_cm?: number | null
          aquarium_min_liters?: number | null
          author_notes?: string | null
          created_at?: string
          difficulty_level_id?: number | null
          id?: number
          image_gallery_urls?: string[] | null
          image_url_main?: string | null
          is_published?: boolean
          latin_name?: string | null
          lifespan_years_max?: number | null
          lifespan_years_min?: number | null
          primary_habitat_id?: number | null
          size_cm_max?: number | null
          size_cm_min?: number | null
          taxonomy_id?: number | null
          updated_at?: string
          water_hardness_dh_max?: number | null
          water_hardness_dh_min?: number | null
          water_ph_max?: number | null
          water_ph_min?: number | null
          water_temperature_max_c?: number | null
          water_temperature_min_c?: number | null
        }
        Update: {
          aquarium_min_edge_length_cm?: number | null
          aquarium_min_liters?: number | null
          author_notes?: string | null
          created_at?: string
          difficulty_level_id?: number | null
          id?: number
          image_gallery_urls?: string[] | null
          image_url_main?: string | null
          is_published?: boolean
          latin_name?: string | null
          lifespan_years_max?: number | null
          lifespan_years_min?: number | null
          primary_habitat_id?: number | null
          size_cm_max?: number | null
          size_cm_min?: number | null
          taxonomy_id?: number | null
          updated_at?: string
          water_hardness_dh_max?: number | null
          water_hardness_dh_min?: number | null
          water_ph_max?: number | null
          water_ph_min?: number | null
          water_temperature_max_c?: number | null
          water_temperature_min_c?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fish_difficulty_level_id_fkey"
            columns: ["difficulty_level_id"]
            isOneToOne: false
            referencedRelation: "difficulty_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fish_primary_habitat_id_fkey"
            columns: ["primary_habitat_id"]
            isOneToOne: false
            referencedRelation: "habitats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fish_taxonomy_id_fkey"
            columns: ["taxonomy_id"]
            isOneToOne: false
            referencedRelation: "taxonomy"
            referencedColumns: ["id"]
          },
        ]
      }
      fish_feeding_categories_map: {
        Row: {
          feeding_category_id: number
          fish_id: number
        }
        Insert: {
          feeding_category_id: number
          fish_id: number
        }
        Update: {
          feeding_category_id?: number
          fish_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fish_feeding_categories_map_feeding_category_id_fkey"
            columns: ["feeding_category_id"]
            isOneToOne: false
            referencedRelation: "feeding_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fish_feeding_categories_map_fish_id_fkey"
            columns: ["fish_id"]
            isOneToOne: false
            referencedRelation: "fish"
            referencedColumns: ["id"]
          },
        ]
      }
      fish_food_types_suitability: {
        Row: {
          feeding_frequency: string | null
          fish_id: number
          food_type_id: number
          notes: string | null
        }
        Insert: {
          feeding_frequency?: string | null
          fish_id: number
          food_type_id: number
          notes?: string | null
        }
        Update: {
          feeding_frequency?: string | null
          fish_id?: number
          food_type_id?: number
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fish_food_types_suitability_fish_id_fkey"
            columns: ["fish_id"]
            isOneToOne: false
            referencedRelation: "fish"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fish_food_types_suitability_food_type_id_fkey"
            columns: ["food_type_id"]
            isOneToOne: false
            referencedRelation: "food_types"
            referencedColumns: ["id"]
          },
        ]
      }
      fish_keeping_types: {
        Row: {
          fish_id: number
          keeping_type_id: number
          notes: string | null
        }
        Insert: {
          fish_id: number
          keeping_type_id: number
          notes?: string | null
        }
        Update: {
          fish_id?: number
          keeping_type_id?: number
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fish_keeping_types_fish_id_fkey"
            columns: ["fish_id"]
            isOneToOne: false
            referencedRelation: "fish"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fish_keeping_types_keeping_type_id_fkey"
            columns: ["keeping_type_id"]
            isOneToOne: false
            referencedRelation: "keeping_types"
            referencedColumns: ["id"]
          },
        ]
      }
      fish_origins: {
        Row: {
          fish_id: number
          is_primary_origin: boolean | null
          origin_id: number
        }
        Insert: {
          fish_id: number
          is_primary_origin?: boolean | null
          origin_id: number
        }
        Update: {
          fish_id?: number
          is_primary_origin?: boolean | null
          origin_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fish_origins_fish_id_fkey"
            columns: ["fish_id"]
            isOneToOne: false
            referencedRelation: "fish"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fish_origins_origin_id_fkey"
            columns: ["origin_id"]
            isOneToOne: false
            referencedRelation: "origins"
            referencedColumns: ["id"]
          },
        ]
      }
      fish_statistics: {
        Row: {
          fish_id: number
          last_viewed_at: string | null
          views_count: number
        }
        Insert: {
          fish_id: number
          last_viewed_at?: string | null
          views_count?: number
        }
        Update: {
          fish_id?: number
          last_viewed_at?: string | null
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "fish_statistics_fish_id_fkey"
            columns: ["fish_id"]
            isOneToOne: true
            referencedRelation: "fish"
            referencedColumns: ["id"]
          },
        ]
      }
      fish_swimming_zones: {
        Row: {
          fish_id: number
          is_primary_zone: boolean | null
          swimming_zone_id: number
        }
        Insert: {
          fish_id: number
          is_primary_zone?: boolean | null
          swimming_zone_id: number
        }
        Update: {
          fish_id?: number
          is_primary_zone?: boolean | null
          swimming_zone_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fish_swimming_zones_fish_id_fkey"
            columns: ["fish_id"]
            isOneToOne: false
            referencedRelation: "fish"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fish_swimming_zones_swimming_zone_id_fkey"
            columns: ["swimming_zone_id"]
            isOneToOne: false
            referencedRelation: "swimming_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      fish_translations: {
        Row: {
          common_other_names: string[] | null
          created_at: string
          description_breeding: string | null
          description_care_aquarium: string | null
          description_general: string | null
          description_habitat_details: string | null
          description_social_behavior: string | null
          fish_id: number
          id: number
          language_code: string
          name: string
          search_vector: unknown
          slug: string
          updated_at: string
        }
        Insert: {
          common_other_names?: string[] | null
          created_at?: string
          description_breeding?: string | null
          description_care_aquarium?: string | null
          description_general?: string | null
          description_habitat_details?: string | null
          description_social_behavior?: string | null
          fish_id: number
          id?: number
          language_code: string
          name: string
          search_vector?: unknown
          slug: string
          updated_at?: string
        }
        Update: {
          common_other_names?: string[] | null
          created_at?: string
          description_breeding?: string | null
          description_care_aquarium?: string | null
          description_general?: string | null
          description_habitat_details?: string | null
          description_social_behavior?: string | null
          fish_id?: number
          id?: number
          language_code?: string
          name?: string
          search_vector?: unknown
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fish_translations_fish_id_fkey"
            columns: ["fish_id"]
            isOneToOne: false
            referencedRelation: "fish"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fish_translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      food_types: {
        Row: {
          created_at: string
          id: number
          is_dry_food: boolean | null
          is_frozen_food: boolean | null
          is_live_food: boolean | null
          name: string
          suitable_for_category_id: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_dry_food?: boolean | null
          is_frozen_food?: boolean | null
          is_live_food?: boolean | null
          name: string
          suitable_for_category_id?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          is_dry_food?: boolean | null
          is_frozen_food?: boolean | null
          is_live_food?: boolean | null
          name?: string
          suitable_for_category_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_types_suitable_for_category_id_fkey"
            columns: ["suitable_for_category_id"]
            isOneToOne: false
            referencedRelation: "feeding_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      habitats: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          typical_hardness_dh_max: number | null
          typical_hardness_dh_min: number | null
          typical_ph_max: number | null
          typical_ph_min: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          typical_hardness_dh_max?: number | null
          typical_hardness_dh_min?: number | null
          typical_ph_max?: number | null
          typical_ph_min?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          typical_hardness_dh_max?: number | null
          typical_hardness_dh_min?: number | null
          typical_ph_max?: number | null
          typical_ph_min?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      keeping_types: {
        Row: {
          created_at: string
          description: string | null
          id: number
          min_group_size: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          min_group_size?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          min_group_size?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string
          created_at: string
          is_active: boolean
          name_en: string
          name_native: string
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          is_active?: boolean
          name_en: string
          name_native: string
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          is_active?: boolean
          name_en?: string
          name_native?: string
          sort_order?: number
        }
        Relationships: []
      }
      origin_cross_references: {
        Row: {
          also_appears_under_id: number
          created_at: string
          origin_id: number
        }
        Insert: {
          also_appears_under_id: number
          created_at?: string
          origin_id: number
        }
        Update: {
          also_appears_under_id?: number
          created_at?: string
          origin_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "origin_cross_references_also_appears_under_id_fkey"
            columns: ["also_appears_under_id"]
            isOneToOne: false
            referencedRelation: "origins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "origin_cross_references_origin_id_fkey"
            columns: ["origin_id"]
            isOneToOne: false
            referencedRelation: "origins"
            referencedColumns: ["id"]
          },
        ]
      }
      origins: {
        Row: {
          created_at: string
          id: number
          name: string
          origin_type: string | null
          parent_id: number | null
          path: unknown
          slug: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          origin_type?: string | null
          parent_id?: number | null
          path?: unknown
          slug?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          origin_type?: string | null
          parent_id?: number | null
          path?: unknown
          slug?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "origins_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "origins"
            referencedColumns: ["id"]
          },
        ]
      }
      swimming_zones: {
        Row: {
          created_at: string
          description: string | null
          id: number
          updated_at: string
          zone_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          updated_at?: string
          zone_name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          updated_at?: string
          zone_name?: string
        }
        Relationships: []
      }
      taxonomy: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          image_url: string | null
          name: string
          path: unknown
          rank: string
          scientific_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          name: string
          path: unknown
          rank: string
          scientific_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          name?: string
          path?: unknown
          rank?: string
          scientific_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      waterbody_countries: {
        Row: {
          country_id: number
          created_at: string | null
          waterbody_id: number
        }
        Insert: {
          country_id: number
          created_at?: string | null
          waterbody_id: number
        }
        Update: {
          country_id?: number
          created_at?: string | null
          waterbody_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "waterbody_countries_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "origins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waterbody_countries_waterbody_id_fkey"
            columns: ["waterbody_id"]
            isOneToOne: false
            referencedRelation: "origins"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      origin_fish_counts_public: {
        Row: {
          origin_id: number | null
          published_fish_count: number | null
          slug: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_refresh_origin_counts: { Args: never; Returns: string }
      fischlexi_array_to_text: { Args: { arr: string[] }; Returns: string }
      fischlexi_search_tsquery: {
        Args: { search_query: string }
        Returns: unknown
      }
      fischlexi_tsv: { Args: { txt: string }; Returns: unknown }
      generate_origin_path_label: {
        Args: { name_input: string }
        Returns: string
      }
      generate_origin_slug: { Args: { name_input: string }; Returns: string }
      get_child_origin_ids: {
        Args: { root_id: number }
        Returns: {
          id: number
        }[]
      }
      get_descendant_origin_ids_by_slugs: {
        Args: { slugs: string[] }
        Returns: {
          id: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      refresh_origin_fish_counts: { Args: never; Returns: undefined }
      search_fish_by_language: {
        Args: {
          lang_code?: string
          page_limit?: number
          page_offset?: number
          search_query: string
        }
        Returns: {
          fish_id: number
          latin_name: string
          name: string
          rank: number
          slug: string
        }[]
      }
      transliterate_german: { Args: { input: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

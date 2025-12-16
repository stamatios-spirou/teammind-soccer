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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      fields: {
        Row: {
          capacity: number | null
          created_at: string | null
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          status: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          name: string
          status?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      match_participants: {
        Row: {
          created_at: string | null
          id: string
          match_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_participants_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          auto_balance: boolean | null
          created_at: string | null
          created_by: string | null
          duration_minutes: number | null
          fairness_score: number | null
          field_id: string | null
          id: string
          is_public: boolean | null
          match_type: Database["public"]["Enums"]["match_type"] | null
          max_players: number | null
          scheduled_at: string
          skill_level: Database["public"]["Enums"]["skill_level"] | null
          updated_at: string | null
        }
        Insert: {
          auto_balance?: boolean | null
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          fairness_score?: number | null
          field_id?: string | null
          id?: string
          is_public?: boolean | null
          match_type?: Database["public"]["Enums"]["match_type"] | null
          max_players?: number | null
          scheduled_at: string
          skill_level?: Database["public"]["Enums"]["skill_level"] | null
          updated_at?: string | null
        }
        Update: {
          auto_balance?: boolean | null
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          fairness_score?: number | null
          field_id?: string | null
          id?: string
          is_public?: boolean | null
          match_type?: Database["public"]["Enums"]["match_type"] | null
          max_players?: number | null
          scheduled_at?: string
          skill_level?: Database["public"]["Enums"]["skill_level"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_captain_only: boolean | null
          match_id: string
          message_type: string | null
          sender_id: string
          team_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_captain_only?: boolean | null
          match_id: string
          message_type?: string | null
          sender_id: string
          team_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_captain_only?: boolean | null
          match_id?: string
          message_type?: string | null
          sender_id?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      player_stats: {
        Row: {
          attendance: boolean | null
          created_at: string | null
          id: string
          match_id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          attendance?: boolean | null
          created_at?: string | null
          id?: string
          match_id: string
          rating?: number | null
          user_id: string
        }
        Update: {
          attendance?: boolean | null
          created_at?: string | null
          id?: string
          match_id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          match_tag: string | null
          media_url: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_tag?: string | null
          media_url?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_tag?: string | null
          media_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          attendance_rate: number | null
          avatar_url: string | null
          created_at: string | null
          email: string
          fair_play_rating: number | null
          full_name: string | null
          games_played: number | null
          home_field_id: string | null
          id: string
          phone: string | null
          preferred_match_type: Database["public"]["Enums"]["match_type"] | null
          preferred_position:
            | Database["public"]["Enums"]["player_position"]
            | null
          skill_level: Database["public"]["Enums"]["skill_level"] | null
          updated_at: string | null
          win_rate: number | null
        }
        Insert: {
          attendance_rate?: number | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          fair_play_rating?: number | null
          full_name?: string | null
          games_played?: number | null
          home_field_id?: string | null
          id: string
          phone?: string | null
          preferred_match_type?:
            | Database["public"]["Enums"]["match_type"]
            | null
          preferred_position?:
            | Database["public"]["Enums"]["player_position"]
            | null
          skill_level?: Database["public"]["Enums"]["skill_level"] | null
          updated_at?: string | null
          win_rate?: number | null
        }
        Update: {
          attendance_rate?: number | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          fair_play_rating?: number | null
          full_name?: string | null
          games_played?: number | null
          home_field_id?: string | null
          id?: string
          phone?: string | null
          preferred_match_type?:
            | Database["public"]["Enums"]["match_type"]
            | null
          preferred_position?:
            | Database["public"]["Enums"]["player_position"]
            | null
          skill_level?: Database["public"]["Enums"]["skill_level"] | null
          updated_at?: string | null
          win_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_home_field_id_fkey"
            columns: ["home_field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      rotations: {
        Row: {
          created_at: string | null
          id: string
          is_on_field: boolean | null
          match_id: string
          team_id: string
          time_block: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_on_field?: boolean | null
          match_id: string
          team_id: string
          time_block: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_on_field?: boolean | null
          match_id?: string
          team_id?: string
          time_block?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rotations_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rotations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rotations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          assigned_position:
            | Database["public"]["Enums"]["player_position"]
            | null
          created_at: string | null
          id: string
          is_captain: boolean | null
          team_id: string
          user_id: string
        }
        Insert: {
          assigned_position?:
            | Database["public"]["Enums"]["player_position"]
            | null
          created_at?: string | null
          id?: string
          is_captain?: boolean | null
          team_id: string
          user_id: string
        }
        Update: {
          assigned_position?:
            | Database["public"]["Enums"]["player_position"]
            | null
          created_at?: string | null
          id?: string
          is_captain?: boolean | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          match_id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          match_id: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          match_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_availability: {
        Row: {
          created_at: string
          date: string
          id: string
          status: string
          time_slot: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          status?: string
          time_slot: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          status?: string
          time_slot?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_availability_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
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
      get_match_id_for_team: { Args: { p_team_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "player" | "captain" | "staff"
      match_type: "casual" | "competitive"
      player_position: "goalkeeper" | "defender" | "midfielder" | "forward"
      skill_level: "beginner" | "intermediate" | "advanced"
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
      app_role: ["player", "captain", "staff"],
      match_type: ["casual", "competitive"],
      player_position: ["goalkeeper", "defender", "midfielder", "forward"],
      skill_level: ["beginner", "intermediate", "advanced"],
    },
  },
} as const

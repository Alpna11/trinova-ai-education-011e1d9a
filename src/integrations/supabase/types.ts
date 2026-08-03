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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          code: string
          id: string
          label: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          code: string
          id?: string
          label: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          code?: string
          id?: string
          label?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      boards: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      chapter_progress: {
        Row: {
          chapter_id: string
          id: string
          last_seen_at: string
          mastery: number
          quizzes_taken: number
          sessions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          id?: string
          last_seen_at?: string
          mastery?: number
          quizzes_taken?: number
          sessions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          id?: string
          last_seen_at?: string
          mastery?: number
          quizzes_taken?: number
          sessions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          position: number
          subject_id: string
          summary: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          position?: number
          subject_id: string
          summary?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          position?: number
          subject_id?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_levels: {
        Row: {
          board_id: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          position: number
        }
        Insert: {
          board_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          position?: number
        }
        Update: {
          board_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "grade_levels_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_records: {
        Row: {
          answer: string | null
          attachment_type: string | null
          attachment_url: string | null
          chapter_id: string | null
          created_at: string
          id: string
          kind: string
          language: string | null
          mode: string | null
          prompt: string | null
          title: string
          user_id: string
        }
        Insert: {
          answer?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          chapter_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          language?: string | null
          mode?: string | null
          prompt?: string | null
          title: string
          user_id: string
        }
        Update: {
          answer?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          chapter_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          language?: string | null
          mode?: string | null
          prompt?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_records_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          board_id: string | null
          created_at: string
          full_name: string | null
          grade_level_id: string | null
          id: string
          last_active_at: string | null
          last_activity_label: string | null
          last_chapter_id: string | null
          last_streak_date: string | null
          second_language: string
          streak_days: number
          updated_at: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          board_id?: string | null
          created_at?: string
          full_name?: string | null
          grade_level_id?: string | null
          id: string
          last_active_at?: string | null
          last_activity_label?: string | null
          last_chapter_id?: string | null
          last_streak_date?: string | null
          second_language?: string
          streak_days?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          board_id?: string | null
          created_at?: string
          full_name?: string | null
          grade_level_id?: string | null
          id?: string
          last_active_at?: string | null
          last_activity_label?: string | null
          last_chapter_id?: string | null
          last_streak_date?: string | null
          second_language?: string
          streak_days?: number
          updated_at?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_last_chapter_id_fkey"
            columns: ["last_chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          answers: Json
          chapter_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          language: string | null
          mode: string
          questions: Json
          score: number | null
          title: string
          total: number
          user_id: string
        }
        Insert: {
          answers?: Json
          chapter_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          language?: string | null
          mode?: string
          questions?: Json
          score?: number | null
          title: string
          total?: number
          user_id: string
        }
        Update: {
          answers?: Json
          chapter_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          language?: string | null
          mode?: string
          questions?: Json
          score?: number | null
          title?: string
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          created_by: string | null
          grade_level_id: string
          icon: string | null
          id: string
          name: string
          position: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          grade_level_id: string
          icon?: string | null
          id?: string
          name: string
          position?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          grade_level_id?: string
          icon?: string | null
          id?: string
          name?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "subjects_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_notes: {
        Row: {
          body: string | null
          chapter_id: string | null
          created_at: string
          id: string
          published: boolean
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          chapter_id?: string | null
          created_at?: string
          id?: string
          published?: boolean
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          chapter_id?: string | null
          created_at?: string
          id?: string
          published?: boolean
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_notes_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
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
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "student" | "teacher" | "parent" | "admin"
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
      app_role: ["student", "teacher", "parent", "admin"],
    },
  },
} as const

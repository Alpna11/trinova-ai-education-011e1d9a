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
      announcements: {
        Row: {
          body: string | null
          class_id: string | null
          created_at: string
          id: string
          published: boolean
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          class_id?: string | null
          created_at?: string
          id?: string
          published?: boolean
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          class_id?: string | null
          created_at?: string
          id?: string
          published?: boolean
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          content: string | null
          feedback: string | null
          file_url: string | null
          id: string
          marks: number | null
          student_id: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          assignment_id: string
          content?: string | null
          feedback?: string | null
          file_url?: string | null
          id?: string
          marks?: number | null
          student_id: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          content?: string | null
          feedback?: string | null
          file_url?: string | null
          id?: string
          marks?: number | null
          student_id?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          chapter_id: string | null
          class_id: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          max_marks: number
          published: boolean
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          chapter_id?: string | null
          class_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          max_marks?: number
          published?: boolean
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          chapter_id?: string | null
          class_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          max_marks?: number
          published?: boolean
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
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
      chapter_content: {
        Row: {
          chapter_id: string
          content: Json
          created_at: string
          id: string
          kind: string
          language: string
          mode: string
          updated_at: string
        }
        Insert: {
          chapter_id: string
          content?: Json
          created_at?: string
          id?: string
          kind: string
          language?: string
          mode?: string
          updated_at?: string
        }
        Update: {
          chapter_id?: string
          content?: Json
          created_at?: string
          id?: string
          kind?: string
          language?: string
          mode?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_content_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
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
      class_enrollments: {
        Row: {
          class_id: string
          created_at: string
          id: string
          student_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          student_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          board_id: string | null
          chapter_id: string | null
          created_at: string
          description: string | null
          grade_level_id: string | null
          id: string
          join_code: string
          name: string
          subject_id: string | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          board_id?: string | null
          chapter_id?: string | null
          created_at?: string
          description?: string | null
          grade_level_id?: string | null
          id?: string
          join_code?: string
          name: string
          subject_id?: string | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          board_id?: string | null
          chapter_id?: string | null
          created_at?: string
          description?: string | null
          grade_level_id?: string | null
          id?: string
          join_code?: string
          name?: string
          subject_id?: string | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_subject_id_fkey"
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
      question_bank: {
        Row: {
          approved: boolean
          board_id: string | null
          chapter_id: string | null
          correct_answer: string | null
          created_at: string
          difficulty: string
          explanation: string | null
          grade_level_id: string | null
          id: string
          kind: string
          marks: number
          options: Json
          prompt: string
          source: string
          subject_id: string | null
          teacher_id: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          approved?: boolean
          board_id?: string | null
          chapter_id?: string | null
          correct_answer?: string | null
          created_at?: string
          difficulty?: string
          explanation?: string | null
          grade_level_id?: string | null
          id?: string
          kind?: string
          marks?: number
          options?: Json
          prompt: string
          source?: string
          subject_id?: string | null
          teacher_id: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          approved?: boolean
          board_id?: string | null
          chapter_id?: string | null
          correct_answer?: string | null
          created_at?: string
          difficulty?: string
          explanation?: string | null
          grade_level_id?: string | null
          id?: string
          kind?: string
          marks?: number
          options?: Json
          prompt?: string
          source?: string
          subject_id?: string | null
          teacher_id?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_bank_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_bank_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_bank_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_bank_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_submissions: {
        Row: {
          answers: Json
          id: string
          quiz_id: string
          score: number | null
          student_id: string
          submitted_at: string
          total: number
          weak_topics: string[]
        }
        Insert: {
          answers?: Json
          id?: string
          quiz_id: string
          score?: number | null
          student_id: string
          submitted_at?: string
          total?: number
          weak_topics?: string[]
        }
        Update: {
          answers?: Json
          id?: string
          quiz_id?: string
          score?: number | null
          student_id?: string
          submitted_at?: string
          total?: number
          weak_topics?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "quiz_submissions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "teacher_quizzes"
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
      study_materials: {
        Row: {
          board_id: string | null
          body: string | null
          chapter_id: string | null
          class_id: string | null
          created_at: string
          description: string | null
          file_type: string | null
          file_url: string | null
          grade_level_id: string | null
          id: string
          published: boolean
          subject_id: string | null
          teacher_id: string
          title: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          board_id?: string | null
          body?: string | null
          chapter_id?: string | null
          class_id?: string | null
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          grade_level_id?: string | null
          id?: string
          published?: boolean
          subject_id?: string | null
          teacher_id: string
          title: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          board_id?: string | null
          body?: string | null
          chapter_id?: string | null
          class_id?: string | null
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          grade_level_id?: string | null
          id?: string
          published?: boolean
          subject_id?: string | null
          teacher_id?: string
          title?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_materials_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_materials_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_materials_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_materials_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_materials_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
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
      teacher_profiles: {
        Row: {
          bio: string | null
          classes_taught: string[]
          created_at: string
          display_name: string | null
          id: string
          subjects: string[]
          updated_at: string
        }
        Insert: {
          bio?: string | null
          classes_taught?: string[]
          created_at?: string
          display_name?: string | null
          id: string
          subjects?: string[]
          updated_at?: string
        }
        Update: {
          bio?: string | null
          classes_taught?: string[]
          created_at?: string
          display_name?: string | null
          id?: string
          subjects?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      teacher_quiz_questions: {
        Row: {
          correct_answer: string | null
          created_at: string
          explanation: string | null
          id: string
          kind: string
          marks: number
          options: Json
          position: number
          prompt: string
          quiz_id: string
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          kind?: string
          marks?: number
          options?: Json
          position?: number
          prompt: string
          quiz_id: string
        }
        Update: {
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          kind?: string
          marks?: number
          options?: Json
          position?: number
          prompt?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "teacher_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_quizzes: {
        Row: {
          chapter_id: string | null
          class_id: string | null
          created_at: string
          id: string
          instructions: string | null
          published: boolean
          subject_id: string | null
          teacher_id: string
          time_limit_minutes: number
          title: string
          total_marks: number
          updated_at: string
        }
        Insert: {
          chapter_id?: string | null
          class_id?: string | null
          created_at?: string
          id?: string
          instructions?: string | null
          published?: boolean
          subject_id?: string | null
          teacher_id: string
          time_limit_minutes?: number
          title: string
          total_marks?: number
          updated_at?: string
        }
        Update: {
          chapter_id?: string | null
          class_id?: string | null
          created_at?: string
          id?: string
          instructions?: string | null
          published?: boolean
          subject_id?: string | null
          teacher_id?: string
          time_limit_minutes?: number
          title?: string
          total_marks?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_quizzes_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_quizzes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_quizzes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
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
      [_ in never]: never
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
      app_role: ["student", "teacher", "parent", "admin"],
    },
  },
} as const

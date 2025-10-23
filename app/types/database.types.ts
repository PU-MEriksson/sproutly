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
      headings: {
        Row: {
          created_at: string
          id: number
          "profile.id": string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: number
          "profile.id"?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: number
          "profile.id"?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "headings_profile.id_fkey"
            columns: ["profile.id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      helpers: {
        Row: {
          created_at: string
          id: number
          username: string
        }
        Insert: {
          created_at?: string
          id?: number
          username: string
        }
        Update: {
          created_at?: string
          id?: number
          username?: string
        }
        Relationships: []
      }
      instruments: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: never
          name: string
        }
        Update: {
          id?: never
          name?: string
        }
        Relationships: []
      }
      profile_helpers: {
        Row: {
          created_at: string
          "helper.id": number | null
          id: number
          "profile.id": string | null
        }
        Insert: {
          created_at?: string
          "helper.id"?: number | null
          id?: number
          "profile.id"?: string | null
        }
        Update: {
          created_at?: string
          "helper.id"?: number | null
          id?: number
          "profile.id"?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_helpers_helper.id_fkey"
            columns: ["helper.id"]
            isOneToOne: false
            referencedRelation: "helpers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_helpers_profile.id_fkey"
            columns: ["profile.id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          archived: boolean | null
          completed: boolean | null
          created_at: string
          id: number
          "task.id": number | null
          title: string
        }
        Insert: {
          archived?: boolean | null
          completed?: boolean | null
          created_at?: string
          id?: number
          "task.id"?: number | null
          title: string
        }
        Update: {
          archived?: boolean | null
          completed?: boolean | null
          created_at?: string
          id?: number
          "task.id"?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_task.id_fkey"
            columns: ["task.id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          archived: boolean | null
          color: string | null
          created_at: string
          id: number
          name: string
          "profile.id": string | null
        }
        Insert: {
          archived?: boolean | null
          color?: string | null
          created_at?: string
          id?: number
          name: string
          "profile.id"?: string | null
        }
        Update: {
          archived?: boolean | null
          color?: string | null
          created_at?: string
          id?: number
          name?: string
          "profile.id"?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tags_profile.id_fkey"
            columns: ["profile.id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_tags: {
        Row: {
          created_at: string
          id: number
          "tag.id": number | null
          "task.id": number | null
        }
        Insert: {
          created_at?: string
          id?: number
          "tag.id"?: number | null
          "task.id"?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          "tag.id"?: number | null
          "task.id"?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "task_tags_tag.id_fkey"
            columns: ["tag.id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_tags_task.id_fkey"
            columns: ["task.id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          archived: boolean | null
          challenging: number | null
          completed: boolean | null
          created_at: string
          deadline: string | null
          description: string | null
          difficult: number | null
          enddate: string | null
          heading_id: number | null
          id: number
          notification: string | null
          priority: number | null
          profile_id: string | null
          startdate: string | null
          title: string
        }
        Insert: {
          archived?: boolean | null
          challenging?: number | null
          completed?: boolean | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          difficult?: number | null
          enddate?: string | null
          heading_id?: number | null
          id?: number
          notification?: string | null
          priority?: number | null
          profile_id?: string | null
          startdate?: string | null
          title: string
        }
        Update: {
          archived?: boolean | null
          challenging?: number | null
          completed?: boolean | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          difficult?: number | null
          enddate?: string | null
          heading_id?: number | null
          id?: number
          notification?: string | null
          priority?: number | null
          profile_id?: string | null
          startdate?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_heading.id_fkey"
            columns: ["heading_id"]
            isOneToOne: false
            referencedRelation: "headings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Tasks_profile.id_fkey"
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
      [_ in never]: never
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

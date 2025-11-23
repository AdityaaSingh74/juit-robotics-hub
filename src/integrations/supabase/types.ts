export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          id: string
          admin_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: Json | null
          created_at?: string
        }
      }
      equipment: {
        Row: {
          id: string
          name: string
          category: string
          description: string | null
          quantity: number
          availability_status: 'available' | 'in_use' | 'maintenance' | 'unavailable'
          image_url: string | null
          specifications: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          description?: string | null
          quantity?: number
          availability_status?: 'available' | 'in_use' | 'maintenance' | 'unavailable'
          image_url?: string | null
          specifications?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          description?: string | null
          quantity?: number
          availability_status?: 'available' | 'in_use' | 'maintenance' | 'unavailable'
          image_url?: string | null
          specifications?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      project_equipment: {
        Row: {
          id: string
          project_id: string | null
          equipment_id: string | null
          quantity_requested: number
          allocated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          equipment_id?: string | null
          quantity_requested?: number
          allocated?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          equipment_id?: string | null
          quantity_requested?: number
          allocated?: boolean
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          student_name: string
          student_email: string
          roll_number: string
          branch: string
          year: string
          contact_number: string | null
          is_team_project: boolean
          team_size: number | null
          team_members: string | null
          category: string
          project_title: string
          description: string
          expected_outcomes: string | null
          duration: string
          required_resources: string[]
          other_resources: string | null
          status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed'
          faculty_comments: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_name: string
          student_email: string
          roll_number: string
          branch: string
          year: string
          contact_number?: string | null
          is_team_project?: boolean
          team_size?: number | null
          team_members?: string | null
          category: string
          project_title: string
          description: string
          expected_outcomes?: string | null
          duration: string
          required_resources: string[]
          other_resources?: string | null
          status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed'
          faculty_comments?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_name?: string
          student_email?: string
          roll_number?: string
          branch?: string
          year?: string
          contact_number?: string | null
          is_team_project?: boolean
          team_size?: number | null
          team_members?: string | null
          category?: string
          project_title?: string
          description?: string
          expected_outcomes?: string | null
          duration?: string
          required_resources?: string[]
          other_resources?: string | null
          status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed'
          faculty_comments?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
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

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never

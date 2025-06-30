import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // We will not throw an error here anymore, as supabase might not be used.
  // console.warn('Missing Supabase environment variables. Features requiring Supabase may not work.')
}

// Initialize supabase client only if env vars are available.
// This allows the app to run without Supabase for features that don't require it.
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Database types
// Ensure this interface is still relevant or remove if Supabase is completely unused.
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
          is_archived: boolean
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
          is_archived?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
          is_archived?: boolean
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string
          metadata: Record<string, any> | null
          reactions: string[] | null
        }
        Insert: {
          id?: string
          chat_id: string
          role: 'user' | 'assistant'
          content: string
          created_at?: string
          metadata?: Record<string, any> | null
          reactions?: string[] | null
        }
        Update: {
          id?: string
          chat_id?: string
          role?: 'user' | 'assistant'
          content?: string
          created_at?: string
          metadata?: Record<string, any> | null
          reactions?: string[] | null
        }
      }
      knowledge_base: {
        Row: {
          id: string
          title: string
          content: string
          source: string
          chapter: string | null
          section: string | null
          embedding: number[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          source: string
          chapter?: string | null
          section?: string | null
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          source?: string
          chapter?: string | null
          section?: string | null
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
      }
      medical_tools_usage: {
        Row: {
          id: string
          user_id: string
          tool_name: string
          input_data: Record<string, any>
          output_data: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tool_name: string
          input_data: Record<string, any>
          output_data: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tool_name?: string
          input_data?: Record<string, any>
          output_data?: Record<string, any>
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_knowledge_base: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          title: string
          content: string
          source: string
          chapter: string | null
          section: string | null
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}


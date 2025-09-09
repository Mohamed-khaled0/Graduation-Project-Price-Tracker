export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string
          created_at: string
          updated_at: string
          roles: string[]
          blocked: boolean
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
          roles?: string[]
          blocked?: boolean
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
          roles?: string[]
          blocked?: boolean
        }
      }
    }
  }
} 
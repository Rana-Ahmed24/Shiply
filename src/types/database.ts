/**
 * Replace with generated types:
 * npx supabase gen types typescript --project-id <id> > src/types/database.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          roles: ("customer" | "traveler" | "admin")[];
          bio: string | null;
          locale: string;
          currency: string;
          is_suspended: boolean;
          suspended_at: string | null;
          stripe_customer_id: string | null;
          traveler_rating_avg: number | null;
          traveler_review_count: number;
          customer_rating_avg: number | null;
          customer_review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          roles?: ("customer" | "traveler" | "admin")[];
          bio?: string | null;
          locale?: string;
          currency?: string;
          is_suspended?: boolean;
          suspended_at?: string | null;
          stripe_customer_id?: string | null;
          traveler_rating_avg?: number | null;
          traveler_review_count?: number;
          customer_rating_avg?: number | null;
          customer_review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          roles?: ("customer" | "traveler" | "admin")[];
          bio?: string | null;
          locale?: string;
          currency?: string;
          is_suspended?: boolean;
          suspended_at?: string | null;
          stripe_customer_id?: string | null;
          traveler_rating_avg?: number | null;
          traveler_review_count?: number;
          customer_rating_avg?: number | null;
          customer_review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

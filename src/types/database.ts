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
          onboarding_completed: boolean;
          languages: string[];
          meetup_locations: string[];
          deals_completed: number;
          traveler_tier: "bronze" | "silver" | "gold";
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
          onboarding_completed?: boolean;
          languages?: string[];
          meetup_locations?: string[];
          deals_completed?: number;
          traveler_tier?: "bronze" | "silver" | "gold";
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
          onboarding_completed?: boolean;
          languages?: string[];
          meetup_locations?: string[];
          deals_completed?: number;
          traveler_tier?: "bronze" | "silver" | "gold";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      verifications: {
        Row: {
          type: string;
          status: string;
          user_id: string;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          rating: number;
          comment: string | null;
          created_at: string;
          reviewer_id: string;
          reviewee_id: string;
          is_public: boolean;
          removed_at: string | null;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

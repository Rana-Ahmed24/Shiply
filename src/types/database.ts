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
          preferred_mode: "customer" | "traveler";
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
          preferred_mode?: "customer" | "traveler";
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
          preferred_mode?: "customer" | "traveler";
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
      customer_requests: {
        Row: {
          id: string;
          customer_id: string;
          title: string;
          description: string;
          item_category: string;
          estimated_weight_kg: number | null;
          max_budget: number | null;
          currency: string;
          preferred_origin_country_code: string | null;
          preferred_origin_city: string | null;
          needed_by: string | null;
          status:
            | "draft"
            | "open"
            | "matched"
            | "in_progress"
            | "fulfilled"
            | "cancelled"
            | "expired";
          product_link: string | null;
          urgency: "flexible" | "normal" | "urgent";
          image_urls: string[];
          lifecycle_status:
            | "pending"
            | "accepted"
            | "purchased"
            | "shipped"
            | "delivered"
            | "cancelled";
          published_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          title: string;
          description: string;
          item_category: string;
          estimated_weight_kg?: number | null;
          max_budget?: number | null;
          currency?: string;
          preferred_origin_country_code?: string | null;
          preferred_origin_city?: string | null;
          needed_by?: string | null;
          status?:
            | "draft"
            | "open"
            | "matched"
            | "in_progress"
            | "fulfilled"
            | "cancelled"
            | "expired";
          product_link?: string | null;
          urgency?: "flexible" | "normal" | "urgent";
          image_urls?: string[];
          lifecycle_status?:
            | "pending"
            | "accepted"
            | "purchased"
            | "shipped"
            | "delivered"
            | "cancelled";
          published_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          title?: string;
          description?: string;
          item_category?: string;
          estimated_weight_kg?: number | null;
          max_budget?: number | null;
          currency?: string;
          preferred_origin_country_code?: string | null;
          preferred_origin_city?: string | null;
          needed_by?: string | null;
          status?:
            | "draft"
            | "open"
            | "matched"
            | "in_progress"
            | "fulfilled"
            | "cancelled"
            | "expired";
          product_link?: string | null;
          urgency?: "flexible" | "normal" | "urgent";
          image_urls?: string[];
          lifecycle_status?:
            | "pending"
            | "accepted"
            | "purchased"
            | "shipped"
            | "delivered"
            | "cancelled";
          published_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      traveler_listings: {
        Row: {
          id: string;
          traveler_id: string;
          origin_city: string;
          origin_country_code: string;
          destination_city: string;
          destination_country_code: string;
          departure_at: string | null;
          arrival_at: string;
          available_weight_kg: number;
          service_type: "shop_and_ship" | "ship_only" | "both";
          accepted_categories: string[];
          notes: string | null;
          delivery_preferences: string[];
          status: "draft" | "active" | "paused" | "expired" | "cancelled";
          published_at: string | null;
          expires_at: string | null;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          traveler_id: string;
          origin_city: string;
          origin_country_code: string;
          destination_city?: string;
          destination_country_code?: string;
          departure_at?: string | null;
          arrival_at: string;
          available_weight_kg: number;
          service_type?: "shop_and_ship" | "ship_only" | "both";
          accepted_categories?: string[];
          notes?: string | null;
          delivery_preferences?: string[];
          status?: "draft" | "active" | "paused" | "expired" | "cancelled";
          published_at?: string | null;
          expires_at?: string | null;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          traveler_id?: string;
          origin_city?: string;
          origin_country_code?: string;
          destination_city?: string;
          destination_country_code?: string;
          departure_at?: string | null;
          arrival_at?: string;
          available_weight_kg?: number;
          service_type?: "shop_and_ship" | "ship_only" | "both";
          accepted_categories?: string[];
          notes?: string | null;
          delivery_preferences?: string[];
          status?: "draft" | "active" | "paused" | "expired" | "cancelled";
          published_at?: string | null;
          expires_at?: string | null;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      delivery_matches: {
        Row: {
          id: string;
          listing_id: string;
          request_id: string;
          traveler_id: string;
          customer_id: string;
          agreed_price: number;
          currency: string;
          platform_fee_amount: number;
          status: string;
          initiated_by: string;
          accepted_at: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          compatibility_score: number | null;
          compatibility_factors: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          request_id: string;
          traveler_id: string;
          customer_id: string;
          agreed_price: number;
          currency?: string;
          platform_fee_amount?: number;
          status?: string;
          initiated_by: string;
          compatibility_score?: number | null;
          compatibility_factors?: Json;
        };
        Update: Record<string, unknown>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          match_id: string;
          sender_id: string;
          body: string;
          attachment_paths: string[];
          is_system: boolean;
          edited_at: string | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          match_id: string;
          sender_id: string;
          body: string;
          attachment_paths?: string[];
          is_system?: boolean;
        };
        Update: Record<string, unknown>;
        Relationships: [];
      };
      message_reads: {
        Row: {
          message_id: string;
          user_id: string;
          read_at: string;
        };
        Insert: {
          message_id: string;
          user_id: string;
          read_at?: string;
        };
        Update: Record<string, unknown>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          channel: string;
          title: string;
          body: string;
          data: Json;
          read_at: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: string;
          channel?: string;
          title: string;
          body: string;
          data?: Json;
        };
        Update: Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_read_message_ids: {
        Args: { p_match_id: string; p_viewer_id: string };
        Returns: string[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

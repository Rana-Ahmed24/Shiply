-- =============================================================================
-- Shiply Egypt — Initial PostgreSQL schema (Supabase)
-- Marketplace: travelers ↔ customers, escrow, messaging, verification
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE public.user_role AS ENUM (
  'customer',
  'traveler',
  'admin'
);

CREATE TYPE public.listing_status AS ENUM (
  'draft',
  'active',
  'paused',
  'expired',
  'cancelled'
);

CREATE TYPE public.request_status AS ENUM (
  'draft',
  'open',
  'matched',
  'in_progress',
  'fulfilled',
  'cancelled',
  'expired'
);

CREATE TYPE public.service_type AS ENUM (
  'shop_and_ship',
  'ship_only',
  'both'
);

CREATE TYPE public.match_status AS ENUM (
  'pending',           -- traveler or customer proposed
  'accepted',          -- both parties agreed
  'deposit_pending',   -- awaiting customer deposit
  'deposit_held',      -- funds in escrow
  'in_transit',
  'delivered',         -- traveler marked delivered
  'completed',         -- customer confirmed + reviews window
  'disputed',
  'cancelled',
  'refunded'
);

CREATE TYPE public.deposit_status AS ENUM (
  'pending',
  'processing',
  'held',
  'partially_released',
  'released',
  'refunded',
  'failed',
  'disputed'
);

CREATE TYPE public.transaction_type AS ENUM (
  'deposit_capture',
  'platform_fee',
  'traveler_payout',
  'refund_full',
  'refund_partial',
  'chargeback',
  'adjustment'
);

CREATE TYPE public.transaction_status AS ENUM (
  'pending',
  'processing',
  'succeeded',
  'failed',
  'cancelled',
  'reversed'
);

CREATE TYPE public.verification_type AS ENUM (
  'email',
  'phone',
  'government_id',
  'passport',
  'flight_itinerary',
  'selfie_liveness'
);

CREATE TYPE public.verification_status AS ENUM (
  'pending',
  'in_review',
  'approved',
  'rejected',
  'expired'
);

CREATE TYPE public.notification_type AS ENUM (
  'match_update',
  'message',
  'deposit',
  'verification',
  'review',
  'system',
  'admin'
);

CREATE TYPE public.notification_channel AS ENUM (
  'in_app',
  'email',
  'push',
  'sms'
);

CREATE TYPE public.admin_action_type AS ENUM (
  'user_suspend',
  'user_unsuspend',
  'listing_remove',
  'listing_restore',
  'request_remove',
  'match_force_cancel',
  'match_force_complete',
  'deposit_release',
  'deposit_refund',
  'verification_approve',
  'verification_reject',
  'review_remove',
  'note_added'
);

CREATE TYPE public.admin_target_type AS ENUM (
  'user',
  'traveler_listing',
  'customer_request',
  'delivery_match',
  'deposit',
  'verification',
  'review',
  'message'
);

-- =============================================================================
-- SHARED: updated_at trigger
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

-- =============================================================================
-- USERS (profile extends Supabase auth.users)
-- =============================================================================

CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email           CITEXT NOT NULL,
  full_name       TEXT,
  avatar_url      TEXT,
  phone           TEXT,
  roles           public.user_role[] NOT NULL DEFAULT ARRAY['customer']::public.user_role[],
  bio             TEXT,
  locale          TEXT NOT NULL DEFAULT 'en',
  currency        CHAR(3) NOT NULL DEFAULT 'EGP',
  is_suspended    BOOLEAN NOT NULL DEFAULT FALSE,
  suspended_at    TIMESTAMPTZ,
  stripe_customer_id TEXT,
  traveler_rating_avg   NUMERIC(3, 2),
  traveler_review_count INTEGER NOT NULL DEFAULT 0,
  customer_rating_avg     NUMERIC(3, 2),
  customer_review_count   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT profiles_email_unique UNIQUE (email),
  CONSTRAINT profiles_roles_not_empty CHECK (cardinality(roles) >= 1),
  CONSTRAINT profiles_traveler_rating_range CHECK (
    traveler_rating_avg IS NULL OR (traveler_rating_avg >= 1 AND traveler_rating_avg <= 5)
  ),
  CONSTRAINT profiles_customer_rating_range CHECK (
    customer_rating_avg IS NULL OR (customer_rating_avg >= 1 AND customer_rating_avg <= 5)
  )
);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- TRAVELER LISTINGS
-- =============================================================================

CREATE TABLE public.traveler_listings (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  traveler_id             UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  origin_city             TEXT NOT NULL,
  origin_country_code     CHAR(2) NOT NULL,
  destination_city        TEXT NOT NULL DEFAULT 'Cairo',
  destination_country_code CHAR(2) NOT NULL DEFAULT 'EG',
  departure_at            TIMESTAMPTZ,
  arrival_at              TIMESTAMPTZ NOT NULL,
  available_weight_kg     NUMERIC(8, 2) NOT NULL,
  service_type            public.service_type NOT NULL DEFAULT 'both',
  accepted_categories     TEXT[] NOT NULL DEFAULT '{}',
  notes                   TEXT,
  status                  public.listing_status NOT NULL DEFAULT 'draft',
  published_at            TIMESTAMPTZ,
  expires_at              TIMESTAMPTZ,
  view_count              INTEGER NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT traveler_listings_weight_positive CHECK (available_weight_kg > 0),
  CONSTRAINT traveler_listings_arrival_after_departure CHECK (
    departure_at IS NULL OR arrival_at >= departure_at
  )
);

CREATE TRIGGER traveler_listings_set_updated_at
  BEFORE UPDATE ON public.traveler_listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- CUSTOMER REQUESTS
-- =============================================================================

CREATE TABLE public.customer_requests (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id             UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title                   TEXT NOT NULL,
  description             TEXT NOT NULL,
  item_category           TEXT NOT NULL,
  estimated_weight_kg     NUMERIC(8, 2),
  max_budget              NUMERIC(12, 2),
  currency                CHAR(3) NOT NULL DEFAULT 'EGP',
  preferred_origin_country_code CHAR(2),
  preferred_origin_city   TEXT,
  needed_by               DATE,
  status                  public.request_status NOT NULL DEFAULT 'draft',
  published_at            TIMESTAMPTZ,
  expires_at              TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT customer_requests_budget_positive CHECK (
    max_budget IS NULL OR max_budget > 0
  ),
  CONSTRAINT customer_requests_weight_positive CHECK (
    estimated_weight_kg IS NULL OR estimated_weight_kg > 0
  )
);

CREATE TRIGGER customer_requests_set_updated_at
  BEFORE UPDATE ON public.customer_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- DELIVERY MATCHES (links listing + request + parties)
-- =============================================================================

CREATE TABLE public.delivery_matches (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id              UUID NOT NULL REFERENCES public.traveler_listings (id) ON DELETE RESTRICT,
  request_id              UUID NOT NULL REFERENCES public.customer_requests (id) ON DELETE RESTRICT,
  traveler_id             UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  customer_id             UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  agreed_price            NUMERIC(12, 2) NOT NULL,
  currency                CHAR(3) NOT NULL DEFAULT 'EGP',
  platform_fee_amount     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status                  public.match_status NOT NULL DEFAULT 'pending',
  initiated_by            UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  accepted_at             TIMESTAMPTZ,
  deposit_held_at         TIMESTAMPTZ,
  delivered_at            TIMESTAMPTZ,
  completed_at            TIMESTAMPTZ,
  cancelled_at            TIMESTAMPTZ,
  cancellation_reason     TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT delivery_matches_price_positive CHECK (agreed_price > 0),
  CONSTRAINT delivery_matches_platform_fee_non_negative CHECK (platform_fee_amount >= 0),
  CONSTRAINT delivery_matches_parties_distinct CHECK (traveler_id <> customer_id),
  CONSTRAINT delivery_matches_request_unique UNIQUE (request_id)
);

CREATE TRIGGER delivery_matches_set_updated_at
  BEFORE UPDATE ON public.delivery_matches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- DEPOSITS (escrow — one active deposit per match)
-- =============================================================================

CREATE TABLE public.deposits (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id                UUID NOT NULL REFERENCES public.delivery_matches (id) ON DELETE RESTRICT,
  customer_id             UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  amount                  NUMERIC(12, 2) NOT NULL,
  currency                CHAR(3) NOT NULL DEFAULT 'EGP',
  status                  public.deposit_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_charge_id        TEXT,
  held_at                 TIMESTAMPTZ,
  released_at             TIMESTAMPTZ,
  refunded_at             TIMESTAMPTZ,
  failure_reason          TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT deposits_amount_positive CHECK (amount > 0),
  CONSTRAINT deposits_match_unique UNIQUE (match_id)
);

CREATE TRIGGER deposits_set_updated_at
  BEFORE UPDATE ON public.deposits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- TRANSACTIONS (financial ledger / audit trail)
-- =============================================================================

CREATE TABLE public.transactions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id                UUID REFERENCES public.delivery_matches (id) ON DELETE SET NULL,
  deposit_id              UUID REFERENCES public.deposits (id) ON DELETE SET NULL,
  user_id                 UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  type                    public.transaction_type NOT NULL,
  status                  public.transaction_status NOT NULL DEFAULT 'pending',
  amount                  NUMERIC(12, 2) NOT NULL,
  currency                CHAR(3) NOT NULL DEFAULT 'EGP',
  stripe_payment_intent_id TEXT,
  stripe_transfer_id      TEXT,
  stripe_refund_id        TEXT,
  idempotency_key         TEXT,
  metadata                JSONB NOT NULL DEFAULT '{}',
  processed_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT transactions_amount_non_zero CHECK (amount <> 0),
  CONSTRAINT transactions_idempotency_unique UNIQUE (idempotency_key)
);

CREATE TRIGGER transactions_set_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- MESSAGES
-- =============================================================================

CREATE TABLE public.messages (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id                UUID NOT NULL REFERENCES public.delivery_matches (id) ON DELETE CASCADE,
  sender_id               UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  body                    TEXT NOT NULL,
  attachment_paths        TEXT[] NOT NULL DEFAULT '{}',
  is_system               BOOLEAN NOT NULL DEFAULT FALSE,
  edited_at               TIMESTAMPTZ,
  deleted_at              TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT messages_body_not_empty CHECK (
    deleted_at IS NOT NULL OR length(trim(body)) > 0
  )
);

CREATE TABLE public.message_reads (
  message_id              UUID NOT NULL REFERENCES public.messages (id) ON DELETE CASCADE,
  user_id                 UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  read_at                 TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (message_id, user_id)
);

-- =============================================================================
-- REVIEWS (dual-sided per match)
-- =============================================================================

CREATE TABLE public.reviews (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id                UUID NOT NULL REFERENCES public.delivery_matches (id) ON DELETE CASCADE,
  reviewer_id             UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  reviewee_id             UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  rating                  SMALLINT NOT NULL,
  comment                 TEXT,
  is_public               BOOLEAN NOT NULL DEFAULT TRUE,
  is_flagged              BOOLEAN NOT NULL DEFAULT FALSE,
  removed_at              TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT reviews_rating_range CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT reviews_parties_distinct CHECK (reviewer_id <> reviewee_id),
  CONSTRAINT reviews_one_per_reviewer_per_match UNIQUE (match_id, reviewer_id)
);

CREATE TRIGGER reviews_set_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- VERIFICATIONS
-- =============================================================================

CREATE TABLE public.verifications (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  type                    public.verification_type NOT NULL,
  status                  public.verification_status NOT NULL DEFAULT 'pending',
  document_storage_path   TEXT,
  reviewed_by             UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  rejection_reason        TEXT,
  expires_at              TIMESTAMPTZ,
  metadata                JSONB NOT NULL DEFAULT '{}',
  submitted_at            TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  reviewed_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER verifications_set_updated_at
  BEFORE UPDATE ON public.verifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Partial unique: one active verification per type per user
CREATE UNIQUE INDEX verifications_user_type_active_unique
  ON public.verifications (user_id, type)
  WHERE status IN ('pending', 'in_review', 'approved');

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

CREATE TABLE public.notifications (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  type                    public.notification_type NOT NULL,
  channel                 public.notification_channel NOT NULL DEFAULT 'in_app',
  title                   TEXT NOT NULL,
  body                    TEXT NOT NULL,
  data                    JSONB NOT NULL DEFAULT '{}',
  read_at                 TIMESTAMPTZ,
  sent_at                 TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- =============================================================================
-- ADMIN ACTIONS (audit log)
-- =============================================================================

CREATE TABLE public.admin_actions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id                UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  action_type             public.admin_action_type NOT NULL,
  target_type             public.admin_target_type NOT NULL,
  target_id               UUID NOT NULL,
  reason                  TEXT,
  metadata                JSONB NOT NULL DEFAULT '{}',
  ip_address              INET,
  user_agent              TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Profiles
CREATE INDEX profiles_roles_gin_idx ON public.profiles USING GIN (roles);
CREATE INDEX profiles_created_at_idx ON public.profiles (created_at DESC);
CREATE INDEX profiles_active_travelers_idx ON public.profiles (traveler_rating_avg DESC)
  WHERE NOT is_suspended AND 'traveler' = ANY (roles);

-- Traveler listings (search & browse)
CREATE INDEX traveler_listings_traveler_id_idx ON public.traveler_listings (traveler_id);
CREATE INDEX traveler_listings_active_browse_idx
  ON public.traveler_listings (destination_country_code, arrival_at, status)
  WHERE status = 'active';
CREATE INDEX traveler_listings_origin_route_idx
  ON public.traveler_listings (origin_country_code, origin_city, destination_city);
CREATE INDEX traveler_listings_arrival_at_idx ON public.traveler_listings (arrival_at)
  WHERE status = 'active';
CREATE INDEX traveler_listings_categories_gin_idx
  ON public.traveler_listings USING GIN (accepted_categories);
CREATE INDEX traveler_listings_created_at_idx ON public.traveler_listings (created_at DESC);

-- Customer requests
CREATE INDEX customer_requests_customer_id_idx ON public.customer_requests (customer_id);
CREATE INDEX customer_requests_open_browse_idx
  ON public.customer_requests (status, needed_by, created_at DESC)
  WHERE status IN ('open', 'matched');
CREATE INDEX customer_requests_origin_pref_idx
  ON public.customer_requests (preferred_origin_country_code, preferred_origin_city)
  WHERE status = 'open';
CREATE INDEX customer_requests_category_idx ON public.customer_requests (item_category);

-- Delivery matches
CREATE INDEX delivery_matches_listing_id_idx ON public.delivery_matches (listing_id);
CREATE INDEX delivery_matches_traveler_id_status_idx
  ON public.delivery_matches (traveler_id, status, updated_at DESC);
CREATE INDEX delivery_matches_customer_id_status_idx
  ON public.delivery_matches (customer_id, status, updated_at DESC);
CREATE INDEX delivery_matches_status_updated_idx
  ON public.delivery_matches (status, updated_at DESC);

-- Deposits
CREATE INDEX deposits_customer_id_status_idx ON public.deposits (customer_id, status);
CREATE INDEX deposits_stripe_payment_intent_idx ON public.deposits (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- Transactions (ledger queries)
CREATE INDEX transactions_user_id_created_idx ON public.transactions (user_id, created_at DESC);
CREATE INDEX transactions_match_id_idx ON public.transactions (match_id);
CREATE INDEX transactions_deposit_id_idx ON public.transactions (deposit_id);
CREATE INDEX transactions_status_pending_idx ON public.transactions (status, created_at)
  WHERE status IN ('pending', 'processing');

-- Messages (chat pagination)
CREATE INDEX messages_match_created_idx ON public.messages (match_id, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX messages_sender_id_idx ON public.messages (sender_id);
CREATE INDEX message_reads_user_unread_idx ON public.message_reads (user_id, read_at DESC);

-- Reviews
CREATE INDEX reviews_reviewee_public_idx
  ON public.reviews (reviewee_id, created_at DESC)
  WHERE is_public AND removed_at IS NULL;
CREATE INDEX reviews_match_id_idx ON public.reviews (match_id);

-- Verifications
CREATE INDEX verifications_user_id_idx ON public.verifications (user_id, type, status);
CREATE INDEX verifications_pending_queue_idx
  ON public.verifications (status, submitted_at)
  WHERE status IN ('pending', 'in_review');

-- Notifications
CREATE INDEX notifications_user_unread_idx
  ON public.notifications (user_id, created_at DESC)
  WHERE read_at IS NULL;
CREATE INDEX notifications_user_created_idx ON public.notifications (user_id, created_at DESC);

-- Admin actions (audit)
CREATE INDEX admin_actions_admin_created_idx ON public.admin_actions (admin_id, created_at DESC);
CREATE INDEX admin_actions_target_idx ON public.admin_actions (target_type, target_id, created_at DESC);
CREATE INDEX admin_actions_type_created_idx ON public.admin_actions (action_type, created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (enable — policies in separate migration)
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traveler_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

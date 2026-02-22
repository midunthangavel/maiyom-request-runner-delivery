-- ================================================================
-- MAIYOM MISSIONS — Complete Database Setup
-- Run this in Supabase Dashboard → SQL Editor
-- This script creates/updates ALL tables, RLS policies, indexes,
-- and triggers. Safe to run on existing databases (uses IF NOT EXISTS).
-- ================================================================


-- ============================================================
-- 1. PROFILES TABLE
-- Stores user profile data (linked to Supabase Auth users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL DEFAULT '',
    email           TEXT,
    phone           TEXT,
    username        TEXT UNIQUE,
    avatar_url      TEXT,
    role            TEXT NOT NULL DEFAULT 'requester' CHECK (role IN ('requester', 'runner', 'both')),
    city            TEXT,
    location        TEXT,
    address         TEXT,
    dob             DATE,
    aadhaar_number  TEXT,
    pan_number      TEXT,
    aadhaar_verified BOOLEAN DEFAULT false,
    rating          NUMERIC(3,2) DEFAULT 5.0,
    completed_missions INTEGER DEFAULT 0,
    verification_level INTEGER DEFAULT 1 CHECK (verification_level BETWEEN 1 AND 3),
    wallet_balance  NUMERIC(10,2) DEFAULT 0.00,
    saved_locations JSONB DEFAULT '[]'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read any profile (needed for viewing runners, requesters)
DO $$ BEGIN
    CREATE POLICY "Anyone authenticated can read profiles"
        ON profiles FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Users can insert their own profile
DO $$ BEGIN
    CREATE POLICY "Users can insert own profile"
        ON profiles FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Users can update their own profile
DO $$ BEGIN
    CREATE POLICY "Users can update own profile"
        ON profiles FOR UPDATE TO authenticated
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- 2. MISSIONS TABLE
-- Delivery missions posted by requesters
-- ============================================================
CREATE TABLE IF NOT EXISTS missions (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title             TEXT NOT NULL,
    description       TEXT NOT NULL DEFAULT '',
    scenario          TEXT NOT NULL DEFAULT 'traveling' CHECK (scenario IN ('traveling', 'event', 'urgent')),
    from_location     TEXT DEFAULT '',
    to_location       TEXT DEFAULT '',
    delivery_location TEXT DEFAULT '',
    arrival_time      TEXT DEFAULT 'ASAP',
    budget_min        NUMERIC(10,2) DEFAULT 0,
    budget_max        NUMERIC(10,2) DEFAULT 0,
    status            TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'offered', 'accepted', 'in_transit', 'delivered')),
    category          TEXT DEFAULT 'General',
    distance          TEXT,
    image_url         TEXT,
    lat               DOUBLE PRECISION,
    lng               DOUBLE PRECISION,
    created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read missions (feed, map, search)
DO $$ BEGIN
    CREATE POLICY "Anyone authenticated can read missions"
        ON missions FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Only the requester can create their own missions
DO $$ BEGIN
    CREATE POLICY "Requesters can insert own missions"
        ON missions FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = requester_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Requester can update their own missions, or any authenticated user for status changes
DO $$ BEGIN
    CREATE POLICY "Authenticated users can update missions"
        ON missions FOR UPDATE TO authenticated
        USING (true)
        WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Index for fast feed queries
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_requester ON missions(requester_id);
CREATE INDEX IF NOT EXISTS idx_missions_created_at ON missions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_missions_coords ON missions(lat, lng) WHERE lat IS NOT NULL;


-- ============================================================
-- 3. OFFERS TABLE
-- Runner offers on missions
-- ============================================================
CREATE TABLE IF NOT EXISTS offers (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id      UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    runner_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    price           NUMERIC(10,2) NOT NULL,
    note            TEXT DEFAULT '',
    item_photo_url  TEXT,
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(mission_id, runner_id)  -- One offer per runner per mission
);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read offers (requester needs to see runner offers)
DO $$ BEGIN
    CREATE POLICY "Anyone authenticated can read offers"
        ON offers FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Runners can submit offers
DO $$ BEGIN
    CREATE POLICY "Runners can insert own offers"
        ON offers FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = runner_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow updates (accept/reject by requester, or status changes)
DO $$ BEGIN
    CREATE POLICY "Authenticated users can update offers"
        ON offers FOR UPDATE TO authenticated
        USING (true)
        WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_offers_mission ON offers(mission_id);
CREATE INDEX IF NOT EXISTS idx_offers_runner ON offers(runner_id);


-- ============================================================
-- 4. MESSAGES TABLE
-- Chat messages between requester and runner per mission
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id  UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    sender_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    text        TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Participants of a mission can read its messages
DO $$ BEGIN
    CREATE POLICY "Mission participants can read messages"
        ON messages FOR SELECT TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM missions m
                WHERE m.id = messages.mission_id
                AND (m.requester_id = auth.uid()
                     OR EXISTS (SELECT 1 FROM offers o WHERE o.mission_id = m.id AND o.runner_id = auth.uid() AND o.status = 'accepted'))
            )
        );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Authenticated users can send messages
DO $$ BEGIN
    CREATE POLICY "Users can insert messages"
        ON messages FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = sender_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_messages_mission ON messages(mission_id, created_at);

-- Enable Realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE messages;


-- ============================================================
-- 5. NOTIFICATIONS TABLE
-- In-app notifications for users
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    body        TEXT NOT NULL DEFAULT '',
    type        TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    read        BOOLEAN DEFAULT false,
    action_url  TEXT,
    time        TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notifications
DO $$ BEGIN
    CREATE POLICY "Users can read own notifications"
        ON notifications FOR SELECT TO authenticated
        USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- System/trigger can insert notifications for any user
DO $$ BEGIN
    CREATE POLICY "Authenticated can insert notifications"
        ON notifications FOR INSERT TO authenticated
        WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Users can update (mark as read) their own notifications
DO $$ BEGIN
    CREATE POLICY "Users can update own notifications"
        ON notifications FOR UPDATE TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE read = false;

-- Enable Realtime for live notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;


-- ============================================================
-- 6. REVIEWS TABLE
-- Reviews left by requesters for runners after mission delivery
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    runner_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    requester_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    mission_id      UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    tags            TEXT[] DEFAULT '{}',
    comment         TEXT DEFAULT '',
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(mission_id, requester_id)  -- One review per mission per requester
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read reviews
DO $$ BEGIN
    CREATE POLICY "Anyone can read reviews"
        ON reviews FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Only the requester can insert their review
DO $$ BEGIN
    CREATE POLICY "Requesters can insert reviews"
        ON reviews FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = requester_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_reviews_runner ON reviews(runner_id);
CREATE INDEX IF NOT EXISTS idx_reviews_mission ON reviews(mission_id);


-- ============================================================
-- 7. TRANSACTIONS TABLE
-- Wallet transactions (credits and debits)
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount      NUMERIC(10,2) NOT NULL,
    type        TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    label       TEXT NOT NULL DEFAULT '',
    mission_id  UUID REFERENCES missions(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own transactions
DO $$ BEGIN
    CREATE POLICY "Users can read own transactions"
        ON transactions FOR SELECT TO authenticated
        USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Users can insert their own transactions
DO $$ BEGIN
    CREATE POLICY "Users can insert own transactions"
        ON transactions FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_earnings ON transactions(user_id, type, created_at) WHERE type = 'credit';


-- ============================================================
-- 8. TRIGGERS & FUNCTIONS
-- Auto-update runner stats when reviews/missions are completed
-- ============================================================

-- Function: Update runner average rating when a new review is added
CREATE OR REPLACE FUNCTION update_runner_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET rating = (
        SELECT ROUND(AVG(rating)::numeric, 2)
        FROM reviews
        WHERE runner_id = NEW.runner_id
    )
    WHERE id = NEW.runner_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: After inserting a review
DROP TRIGGER IF EXISTS trigger_update_runner_rating ON reviews;
CREATE TRIGGER trigger_update_runner_rating
    AFTER INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_runner_rating();

-- Function: Increment completed_missions when mission status = 'delivered'
CREATE OR REPLACE FUNCTION increment_completed_missions()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        -- Increment for the runner (from accepted offer)
        UPDATE profiles
        SET completed_missions = COALESCE(completed_missions, 0) + 1
        WHERE id = (
            SELECT runner_id FROM offers
            WHERE mission_id = NEW.id AND status = 'accepted'
            LIMIT 1
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: After updating mission status
DROP TRIGGER IF EXISTS trigger_increment_completed ON missions;
CREATE TRIGGER trigger_increment_completed
    AFTER UPDATE OF status ON missions
    FOR EACH ROW
    EXECUTE FUNCTION increment_completed_missions();

-- Function: Auto-create profile on signup (if not exists)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, name, email, created_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email,
        now()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: After new auth user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- DONE! All tables, policies, indexes, and triggers are set up.
-- ============================================================

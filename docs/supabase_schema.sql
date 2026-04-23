-- ============================================================
-- Table Talk MVP - Supabase Database Schema
-- Run this entire script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste -> Run
-- ============================================================


-- ============================================================
-- 1. CAMPAIGNS
-- Owned by a registered organizer (auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organizer can see/edit their own campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their campaigns"
  ON campaigns FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Anyone with a link can read a campaign (for guest invite flow)
CREATE POLICY "Anyone can view campaigns"
  ON campaigns FOR SELECT
  USING (true);


-- ============================================================
-- 2. SESSIONS
-- A proposed game night tied to a campaign
-- Status: 'polling' | 'confirmed' | 'cancelled'
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id    UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'polling' CHECK (status IN ('polling', 'confirmed', 'cancelled')),
  confirmed_time TIMESTAMPTZ,  -- Set when status = 'confirmed'
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can read sessions (guests need this to view polls)
CREATE POLICY "Anyone can view sessions"
  ON sessions FOR SELECT
  USING (true);

-- Only the campaign owner can insert/update/delete sessions
CREATE POLICY "Campaign owner can manage sessions"
  ON sessions FOR ALL
  USING (
    auth.uid() = (SELECT owner_id FROM campaigns WHERE id = campaign_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT owner_id FROM campaigns WHERE id = campaign_id)
  );


-- ============================================================
-- 3. POLL OPTIONS
-- Proposed date/time options for a session
-- ============================================================
CREATE TABLE IF NOT EXISTS poll_options (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  proposed_time TIMESTAMPTZ NOT NULL,
  votes         INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view poll options"
  ON poll_options FOR SELECT
  USING (true);

CREATE POLICY "Campaign owner can manage poll options"
  ON poll_options FOR ALL
  USING (
    auth.uid() = (
      SELECT c.owner_id FROM campaigns c
      JOIN sessions s ON s.campaign_id = c.id
      WHERE s.id = session_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT c.owner_id FROM campaigns c
      JOIN sessions s ON s.campaign_id = c.id
      WHERE s.id = session_id
    )
  );


-- ============================================================
-- 4. VOTES
-- One vote per user per session (upsert enforced by unique constraint)
-- user_id can be a Supabase auth UUID or a guest UUID string
-- ============================================================
CREATE TABLE IF NOT EXISTS votes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  option_id  UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL,  -- TEXT to allow both auth UUIDs and guest string IDs
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, user_id)  -- enforces one vote per user per session
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes"
  ON votes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert or update their own vote"
  ON votes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update their own vote"
  ON votes FOR UPDATE
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- 5. DATABASE TRIGGER: Auto-update vote counts on poll_options
-- This keeps poll_options.votes accurate whenever a vote is cast
-- ============================================================
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrement old option's vote count if this is an update
  IF TG_OP = 'UPDATE' AND OLD.option_id IS DISTINCT FROM NEW.option_id THEN
    UPDATE poll_options SET votes = votes - 1 WHERE id = OLD.option_id;
  END IF;

  -- Increment new option's vote count
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.option_id IS DISTINCT FROM NEW.option_id) THEN
    UPDATE poll_options SET votes = votes + 1 WHERE id = NEW.option_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_count();


-- ============================================================
-- 6. MESSAGES
-- Session-scoped chat thread
-- is_urgent: if true, this message should be highlighted
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL,       -- TEXT for both auth UUIDs and guest IDs
  user_name  TEXT NOT NULL,
  content    TEXT NOT NULL,
  is_urgent  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view messages"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can send messages"
  ON messages FOR INSERT
  WITH CHECK (true);


-- ============================================================
-- 7. REALTIME: Enable real-time subscriptions for key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE poll_options;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;


-- ============================================================
-- Done! Your Table Talk database schema is ready.
-- ============================================================

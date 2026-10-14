/*
# Multi-user business card schema

## Overview
Replaces the single-row `profile` table with a multi-user model where each person
has their own page (e.g. flateas.com/jonatan, flateas.com/anna) and logs in with
a self-chosen username + password. Projects are scoped per member.

## New Tables

### `members`
- `id` (uuid, PK) — links to auth.users(id) via FK
- `username` (text, unique) — self-chosen, used in URL paths (e.g. /jonatan)
- `name` (text) — display name (e.g. "Jonatan Bennich")
- `email` (text) — contact email shown on card
- `company` (text) — company/employer
- `bio` (text) — short personal description
- `avatar_url` (text, nullable) — profile image URL
- `linkedin_url`, `github_url`, `phone` (text, nullable) — optional contact links
- `created_at`, `updated_at` (timestamps)

### `member_projects`
- `id` (uuid, PK)
- `member_id` (uuid, FK → members.id ON DELETE CASCADE)
- `title`, `slug`, `description` (text)
- `project_url` (text, nullable)
- `display_order` (int) — sort order on the card
- `created_at`, `updated_at` (timestamps)

## Security
- RLS enabled on both tables.
- SELECT: public (anon + authenticated) — visitors can view any member's card and projects.
- INSERT/UPDATE/DELETE: authenticated only, scoped to the member's own rows via auth.uid().
- members.id defaults to the auth user's id (set by trigger on signup).
- A unique constraint on members.username prevents duplicates.
- A unique constraint on (member_id, slug) prevents duplicate project slugs per member.

## Notes
- The old profile and projects tables are kept intact (not dropped) to preserve data.
- A trigger auto-creates a member profile row on signup using the username from
  raw_user_meta_data->>'username' which the frontend sets during signUp().
*/
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  avatar_url text,
  linkedin_url text,
  github_url text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_members" ON members;
CREATE POLICY "public_read_members" ON members FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "owner_insert_member" ON members;
CREATE POLICY "owner_insert_member" ON members FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "owner_update_member" ON members;
CREATE POLICY "owner_update_member" ON members FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "owner_delete_member" ON members;
CREATE POLICY "owner_delete_member" ON members FOR DELETE
  TO authenticated USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS member_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL DEFAULT '',
  project_url text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (member_id, slug)
);

ALTER TABLE member_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_member_projects" ON member_projects;
CREATE POLICY "public_read_member_projects" ON member_projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "owner_insert_member_projects" ON member_projects;
CREATE POLICY "owner_insert_member_projects" ON member_projects FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM members WHERE members.id = member_id AND members.id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_update_member_projects" ON member_projects;
CREATE POLICY "owner_update_member_projects" ON member_projects FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM members WHERE members.id = member_id AND members.id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM members WHERE members.id = member_id AND members.id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_delete_member_projects" ON member_projects;
CREATE POLICY "owner_delete_member_projects" ON member_projects FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM members WHERE members.id = member_id AND members.id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_member_projects_member ON member_projects(member_id);
CREATE INDEX IF NOT EXISTS idx_member_projects_order ON member_projects(member_id, display_order);
CREATE INDEX IF NOT EXISTS idx_members_username ON members(username);

-- Trigger: auto-create member profile row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.members (id, username, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

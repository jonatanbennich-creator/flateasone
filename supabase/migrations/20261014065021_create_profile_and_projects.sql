/*
# Create profile and projects tables for digital business card

1. New Tables
- `profile`: single-row table storing the site owner's personal info (name, email, company, bio, social links, avatar URL).
- `projects`: list of showcased projects with title, description, slug (for URL path like /subaqua), and external URL.
2. Security
- Enable RLS on both tables.
- SELECT: public (anon + authenticated) — visitors can view the business card.
- INSERT/UPDATE/DELETE: authenticated only — only the signed-in owner can edit content.
3. Notes
- The profile table is designed to hold a single row (enforced by a unique constraint on a fixed key).
- Projects have a display order for sorting on the business card.
*/

CREATE TABLE IF NOT EXISTS profile (
  id integer PRIMARY KEY DEFAULT 1,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  avatar_url text,
  linkedin_url text,
  github_url text,
  phone text,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_profile" ON profile;
CREATE POLICY "public_read_profile" ON profile FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "owner_insert_profile" ON profile;
CREATE POLICY "owner_insert_profile" ON profile FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "owner_update_profile" ON profile;
CREATE POLICY "owner_update_profile" ON profile FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "owner_delete_profile" ON profile;
CREATE POLICY "owner_delete_profile" ON profile FOR DELETE
  TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL DEFAULT '',
  project_url text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_projects" ON projects;
CREATE POLICY "public_read_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "owner_insert_projects" ON projects;
CREATE POLICY "owner_insert_projects" ON projects FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "owner_update_projects" ON projects;
CREATE POLICY "owner_update_projects" ON projects FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "owner_delete_projects" ON projects;
CREATE POLICY "owner_delete_projects" ON projects FOR DELETE
  TO authenticated USING (true);

-- Seed default profile data
INSERT INTO profile (id, name, email, company, bio)
VALUES (1, 'Jonatan Bennich', 'jonatan.bennich@gmail.com', 'a.bennich konsulting', 'Konsult inom teknik och innovation. Drivar projekt som kombinerar kreativitet med teknisk lösning.')
ON CONFLICT (id) DO NOTHING;

-- Seed default projects
INSERT INTO projects (title, slug, description, project_url, display_order) VALUES
  ('SubAqua', 'subaqua', 'Ett projekt utforskar undervattensvärlden.', 'https://flateas.com/subaqua', 1),
  ('BigPrint', 'bigprint', 'Storskalig tryckteknik och design.', 'https://flateas.com/bigprint', 2),
  ('Elinor', 'elinor', 'Ett innovativt konceptprojekt.', 'https://flateas.com/elinor', 3)
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(display_order);

-- Enable read access for all tables for anon key
-- Run this in Supabase SQL Editor

-- 1. Domains Table
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON domains FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON domains FOR INSERT WITH CHECK (true);

-- 2. Links Table
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON links FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON links FOR INSERT WITH CHECK (true);

-- 3. Clicks Table (For Realtime & Reports)
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON clicks FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON clicks FOR INSERT WITH CHECK (true);

-- Note: This makes your DB public for these operations. 
-- Since we use a hardcoded login on frontend, anyone with the Anon Key can read/write if they know the API.
-- Ideally, we should secure "INSERT" to authenticated users only, but our current Auth is custom (not Supabase Auth).
-- So "public insert" is necessary for now unless we migrate Auth to Supabase Auth.

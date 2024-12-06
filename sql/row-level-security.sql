ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE vector_entries ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own data" ON users FOR SELECT
USING (clerk_id = current_user);

CREATE POLICY "Users can update their own data" ON users FOR UPDATE
USING (clerk_id = current_user);

-- Journal entries policies
CREATE POLICY "Users can create their own entries" ON journal_entries FOR INSERT
WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = current_user));

CREATE POLICY "Users can view their own entries" ON journal_entries FOR SELECT
USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_user));

CREATE POLICY "Users can update their own entries" ON journal_entries FOR UPDATE
USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_user));

CREATE POLICY "Users can delete their own entries" ON journal_entries FOR DELETE
USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_user));

-- Similar policies for entry_analysis and vector_entries
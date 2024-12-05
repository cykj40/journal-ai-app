
ALTER TABLE users ENABLE ROW LEVEL SECURITY;


ALTER TABLE entries ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Users can view their own data" ON users FOR SELECT
TO authenticated
USING (id = auth.user_id());

CREATE POLICY "Users can update their own data" ON users FOR UPDATE
TO authenticated
USING (id = auth.user_id());


CREATE POLICY "Users can create their own entries" ON entries FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.user_id());

CREATE POLICY "Users can view their own entries" ON entries FOR SELECT
TO authenticated
USING (user_id = auth.user_id());

CREATE POLICY "Users can update their own entries" ON entries FOR UPDATE
TO authenticated
USING (user_id = auth.user_id())
WITH CHECK (user_id = auth.user_id());

CREATE POLICY "Users can delete their own entries" ON entries FOR DELETE
TO authenticated
USING (user_id = auth.user_id());
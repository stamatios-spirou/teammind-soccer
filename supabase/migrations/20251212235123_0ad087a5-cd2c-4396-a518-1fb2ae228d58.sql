-- Fix 1: Restrict user_availability to authenticated users only
DROP POLICY IF EXISTS "Users can view all availability" ON user_availability;
CREATE POLICY "Authenticated users can view availability"
  ON user_availability FOR SELECT TO authenticated
  USING (true);

-- Fix 2: Add write policies for team_members
CREATE POLICY "Match creators can manage team members"
  ON team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      JOIN matches m ON t.match_id = m.id
      WHERE t.id = team_members.team_id
      AND m.created_by = auth.uid()
    )
  );

-- Fix 3: Add missing policies for match_participants
CREATE POLICY "Users can leave matches"
  ON match_participants FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own participation"
  ON match_participants FOR UPDATE
  USING (user_id = auth.uid());

-- Fix 4: Add write policies for player_stats
CREATE POLICY "Match creators and staff can manage stats"
  ON player_stats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE id = player_stats.match_id
      AND created_by = auth.uid()
    )
    OR has_role(auth.uid(), 'staff')
  );

-- Fix 5: Add write policies for rotations
CREATE POLICY "Match creators can manage rotations"
  ON rotations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE id = rotations.match_id
      AND created_by = auth.uid()
    )
  );
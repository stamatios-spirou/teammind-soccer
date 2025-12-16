-- Drop the problematic INSERT policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can join teams" ON public.team_members;

-- Create a simpler INSERT policy - just verify the user is adding themselves
CREATE POLICY "Users can join teams" ON public.team_members
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add a unique constraint to prevent a user from joining multiple teams in the same match
-- First, create a function to get the match_id from a team_id
CREATE OR REPLACE FUNCTION get_match_id_for_team(p_team_id uuid)
RETURNS uuid AS $$
  SELECT match_id FROM teams WHERE id = p_team_id;
$$ LANGUAGE sql STABLE;

-- Create a unique index to prevent duplicate membership per match
-- Using a partial approach with a function-based check isn't possible with unique constraints
-- Instead, we'll use a trigger to enforce this rule

CREATE OR REPLACE FUNCTION check_single_team_per_match()
RETURNS TRIGGER AS $$
DECLARE
  v_match_id uuid;
  v_existing_count integer;
BEGIN
  -- Get the match_id for the team being joined
  SELECT match_id INTO v_match_id FROM teams WHERE id = NEW.team_id;
  
  -- Check if user is already on a team for this match
  SELECT COUNT(*) INTO v_existing_count
  FROM team_members tm
  JOIN teams t ON tm.team_id = t.id
  WHERE tm.user_id = NEW.user_id
  AND t.match_id = v_match_id;
  
  IF v_existing_count > 0 THEN
    RAISE EXCEPTION 'User is already on a team for this match';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS enforce_single_team_per_match ON public.team_members;
CREATE TRIGGER enforce_single_team_per_match
  BEFORE INSERT ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION check_single_team_per_match();
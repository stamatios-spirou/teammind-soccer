-- Fix function search paths for security
CREATE OR REPLACE FUNCTION get_match_id_for_team(p_team_id uuid)
RETURNS uuid AS $$
  SELECT match_id FROM public.teams WHERE id = p_team_id;
$$ LANGUAGE sql STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION check_single_team_per_match()
RETURNS TRIGGER AS $$
DECLARE
  v_match_id uuid;
  v_existing_count integer;
BEGIN
  -- Get the match_id for the team being joined
  SELECT match_id INTO v_match_id FROM public.teams WHERE id = NEW.team_id;
  
  -- Check if user is already on a team for this match
  SELECT COUNT(*) INTO v_existing_count
  FROM public.team_members tm
  JOIN public.teams t ON tm.team_id = t.id
  WHERE tm.user_id = NEW.user_id
  AND t.match_id = v_match_id;
  
  IF v_existing_count > 0 THEN
    RAISE EXCEPTION 'User is already on a team for this match';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
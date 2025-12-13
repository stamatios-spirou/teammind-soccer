-- Add RLS policy for users to join teams (insert themselves)
CREATE POLICY "Users can join teams"
ON public.team_members
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND NOT EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.teams t ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid()
    AND t.match_id = (SELECT match_id FROM public.teams WHERE id = team_members.team_id)
  )
);

-- Add RLS policy for users to leave teams (delete themselves)
CREATE POLICY "Users can leave teams"
ON public.team_members
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
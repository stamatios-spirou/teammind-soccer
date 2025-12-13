-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Captains can create matches" ON public.matches;

-- Create new policy allowing any authenticated user to create matches
CREATE POLICY "Authenticated users can create matches"
ON public.matches
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Also add DELETE policy so creators can delete their own matches
CREATE POLICY "Creators can delete their matches"
ON public.matches
FOR DELETE
USING (created_by = auth.uid());
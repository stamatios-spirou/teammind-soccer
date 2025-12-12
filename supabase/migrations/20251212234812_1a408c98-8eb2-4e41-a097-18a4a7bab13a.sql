-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Create a new policy that only allows authenticated users to view profiles
-- This prevents anonymous users from scraping user data
CREATE POLICY "Authenticated users can view profiles"
  ON profiles FOR SELECT TO authenticated
  USING (true);

-- Users can still view their own profile (more specific for own data access)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
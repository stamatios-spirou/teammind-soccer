-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('player', 'captain', 'staff');

-- Create enum for skill levels
CREATE TYPE public.skill_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Create enum for positions
CREATE TYPE public.player_position AS ENUM ('goalkeeper', 'defender', 'midfielder', 'forward');

-- Create enum for match types
CREATE TYPE public.match_type AS ENUM ('casual', 'competitive');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  preferred_position player_position DEFAULT 'midfielder',
  skill_level skill_level DEFAULT 'intermediate',
  preferred_match_type match_type DEFAULT 'casual',
  attendance_rate DECIMAL(5,2) DEFAULT 0.0,
  games_played INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create function to check user role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create fields table
CREATE TABLE public.fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER DEFAULT 14,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID REFERENCES public.fields(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 90,
  match_type match_type DEFAULT 'casual',
  skill_level skill_level DEFAULT 'intermediate',
  max_players INTEGER DEFAULT 14,
  is_public BOOLEAN DEFAULT true,
  auto_balance BOOLEAN DEFAULT true,
  fairness_score DECIMAL(3,1),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create teams table (for specific match teams)
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#0EEA4A',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_position player_position,
  is_captain BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Create messages table for chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  is_captain_only BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create match_participants table
CREATE TABLE public.match_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, user_id)
);

-- Create player_stats table
CREATE TABLE public.player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  rating DECIMAL(3,1),
  attendance BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rotations table
CREATE TABLE public.rotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  time_block INTEGER NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_on_field BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rotations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

-- Fields policies
CREATE POLICY "Everyone can view fields"
  ON public.fields FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage fields"
  ON public.fields FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'staff'));

-- Matches policies
CREATE POLICY "Users can view public matches"
  ON public.matches FOR SELECT
  TO authenticated
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Captains can create matches"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'captain') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Creators can update their matches"
  ON public.matches FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Teams policies
CREATE POLICY "Users can view teams for matches they can see"
  ON public.teams FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = teams.match_id
      AND (matches.is_public = true OR matches.created_by = auth.uid())
    )
  );

CREATE POLICY "Match creators can manage teams"
  ON public.teams FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = teams.match_id
      AND matches.created_by = auth.uid()
    )
  );

-- Team members policies
CREATE POLICY "Users can view team members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.matches m ON t.match_id = m.id
      WHERE t.id = team_members.team_id
      AND (m.is_public = true OR m.created_by = auth.uid())
    )
  );

-- Messages policies
CREATE POLICY "Users can view messages for their teams"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    (is_captain_only = false AND EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = messages.team_id
      AND tm.user_id = auth.uid()
    ))
    OR
    (is_captain_only = true AND EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = messages.team_id
      AND tm.user_id = auth.uid()
      AND tm.is_captain = true
    ))
  );

CREATE POLICY "Users can send messages to their teams"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = messages.team_id
      AND tm.user_id = auth.uid()
    )
  );

-- Match participants policies
CREATE POLICY "Users can view participants for public matches"
  ON public.match_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = match_participants.match_id
      AND (matches.is_public = true OR matches.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can join matches"
  ON public.match_participants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Player stats policies
CREATE POLICY "Users can view all player stats"
  ON public.player_stats FOR SELECT
  TO authenticated
  USING (true);

-- Rotations policies
CREATE POLICY "Users can view rotations for their matches"
  ON public.rotations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = rotations.match_id
      AND (m.is_public = true OR m.created_by = auth.uid())
    )
  );

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Default role is player
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'player');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some default fields
INSERT INTO public.fields (name, location, capacity) VALUES
  ('Field A - Main Campus', 'Main Campus, North Side', 14),
  ('Field B - Recreation Center', 'Recreation Center', 14),
  ('Field C - West Campus', 'West Campus', 10),
  ('Field D - East Campus', 'East Campus', 12),
  ('South Field', 'South Campus', 14);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
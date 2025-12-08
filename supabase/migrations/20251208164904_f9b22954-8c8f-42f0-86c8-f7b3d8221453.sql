-- Create user_availability table for daily status tracking
CREATE TABLE public.user_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_slot TEXT NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'night')),
  status TEXT NOT NULL DEFAULT 'looking' CHECK (status IN ('looking', 'matched', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.user_availability ENABLE ROW LEVEL SECURITY;

-- Users can view all availability (for counts)
CREATE POLICY "Users can view all availability"
ON public.user_availability
FOR SELECT
USING (true);

-- Users can manage their own availability
CREATE POLICY "Users can insert own availability"
ON public.user_availability
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own availability"
ON public.user_availability
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own availability"
ON public.user_availability
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_availability_updated_at
BEFORE UPDATE ON public.user_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live counts
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_availability;
-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS fair_play_rating decimal DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS win_rate decimal DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS home_field_id uuid REFERENCES public.fields(id);

-- Add geolocation columns to fields table
ALTER TABLE public.fields 
ADD COLUMN IF NOT EXISTS latitude float,
ADD COLUMN IF NOT EXISTS longitude float;

-- Update the two NJIT fields with their coordinates
UPDATE public.fields SET 
  latitude = 40.7424, 
  longitude = -74.1788,
  location = '100 Lock Street, Newark, NJ 07102'
WHERE name ILIKE '%Lubetkin%';

UPDATE public.fields SET 
  latitude = 40.7369, 
  longitude = -74.1724,
  location = '42 Warren Street, Newark, NJ 07102'
WHERE name ILIKE '%Frederick Douglass%' OR name ILIKE '%Douglass%';

-- Insert the two NJIT fields if they don't exist
INSERT INTO public.fields (name, location, capacity, status, latitude, longitude)
SELECT 'Lubetkin Field', '100 Lock Street, Newark, NJ 07102', 22, 'available', 40.7424, -74.1788
WHERE NOT EXISTS (SELECT 1 FROM public.fields WHERE name ILIKE '%Lubetkin%');

INSERT INTO public.fields (name, location, capacity, status, latitude, longitude)
SELECT 'Frederick Douglass Field', '42 Warren Street, Newark, NJ 07102', 22, 'available', 40.7369, -74.1724
WHERE NOT EXISTS (SELECT 1 FROM public.fields WHERE name ILIKE '%Frederick Douglass%' OR name ILIKE '%Douglass%');
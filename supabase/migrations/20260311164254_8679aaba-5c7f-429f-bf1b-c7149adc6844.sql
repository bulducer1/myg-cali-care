-- Create raffles table (admin manages active raffle)
CREATE TABLE public.raffles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  prize_image_url TEXT,
  draw_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create raffle entries table (lean: only essential fields)
CREATE TABLE public.raffle_entries (
  id SERIAL PRIMARY KEY,
  raffle_id UUID NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  receipt_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(raffle_id, phone)
);

-- Enable RLS
ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_entries ENABLE ROW LEVEL SECURITY;

-- Raffles: everyone can read active raffles
CREATE POLICY "Anyone can view active raffles"
  ON public.raffles FOR SELECT
  USING (is_active = true);

-- Raffle entries: anyone can insert (participate)
CREATE POLICY "Anyone can participate in raffle"
  ON public.raffle_entries FOR INSERT
  WITH CHECK (true);

-- Create admin role check function
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Admin policies for raffles (all operations)
CREATE POLICY "Admins can manage raffles"
  ON public.raffles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for raffle entries (read only for admin)
CREATE POLICY "Admins can view all entries"
  ON public.raffle_entries FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for user_roles
CREATE POLICY "Admins can view roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for receipts (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false);

-- Anyone can upload receipts
CREATE POLICY "Anyone can upload receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'receipts');

-- Only admins can view receipts
CREATE POLICY "Admins can view receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'receipts' AND public.has_role(auth.uid(), 'admin'));

-- Security definer function for admin to read all raffles (including inactive)
CREATE OR REPLACE FUNCTION public.get_all_raffles()
RETURNS SETOF public.raffles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.raffles ORDER BY created_at DESC
$$;

-- Security definer function for admin to read all entries
CREATE OR REPLACE FUNCTION public.get_raffle_entries(_raffle_id UUID)
RETURNS SETOF public.raffle_entries
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.raffle_entries
  WHERE raffle_id = _raffle_id
  ORDER BY id ASC
$$;
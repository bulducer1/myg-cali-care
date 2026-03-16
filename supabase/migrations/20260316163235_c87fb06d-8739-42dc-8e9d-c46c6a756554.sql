
-- Add first_name and last_name columns to raffle_entries
ALTER TABLE public.raffle_entries ADD COLUMN first_name text;
ALTER TABLE public.raffle_entries ADD COLUMN last_name text;

-- Migrate existing data
UPDATE public.raffle_entries SET 
  first_name = split_part(full_name, ' ', 1),
  last_name = CASE 
    WHEN position(' ' in full_name) > 0 THEN substring(full_name from position(' ' in full_name) + 1)
    ELSE ''
  END;

-- Make columns NOT NULL after migration
ALTER TABLE public.raffle_entries ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE public.raffle_entries ALTER COLUMN last_name SET NOT NULL;

-- Create admin_emails table for whitelist
CREATE TABLE public.admin_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Only admins can manage admin_emails
CREATE POLICY "Admins can manage admin_emails"
  ON public.admin_emails FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Public can read admin emails for login validation
CREATE POLICY "Anyone can check admin emails"
  ON public.admin_emails FOR SELECT TO public
  USING (true);

-- Insert initial admin email
INSERT INTO public.admin_emails (email) VALUES ('bulducer1@gmail.com');

-- Add DELETE policy for raffle_entries (admins)
CREATE POLICY "Admins can delete entries"
  ON public.raffle_entries FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to check if email is an authorized admin
CREATE OR REPLACE FUNCTION public.is_admin_email(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_emails WHERE email = lower(trim(_email))
  )
$$;

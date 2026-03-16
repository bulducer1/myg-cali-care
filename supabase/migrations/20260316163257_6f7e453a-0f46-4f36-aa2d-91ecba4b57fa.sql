
-- Remove overly permissive public SELECT on admin_emails
DROP POLICY IF EXISTS "Anyone can check admin emails" ON public.admin_emails;

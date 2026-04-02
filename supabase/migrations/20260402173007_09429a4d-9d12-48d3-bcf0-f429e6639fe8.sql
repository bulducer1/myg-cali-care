CREATE TABLE public.featured_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric,
  image_url text,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.featured_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active featured products"
  ON public.featured_products FOR SELECT TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage featured products"
  ON public.featured_products FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

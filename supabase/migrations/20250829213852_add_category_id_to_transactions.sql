ALTER TABLE public.transactions
ADD COLUMN category_id uuid references public.categories(id) on delete set null;

-- Run in Supabase SQL Editor if /admin/* returns 500 / stack depth errors
-- for admin users (is_admin() ↔ profiles RLS recursion).

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('row_security', 'off', true);
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND 'admin' = ANY (roles)
      AND NOT is_suspended
  );
END;
$$;

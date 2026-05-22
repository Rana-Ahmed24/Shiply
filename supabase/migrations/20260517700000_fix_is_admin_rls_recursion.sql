-- Prevent infinite RLS recursion: profiles policies call is_admin(),
-- and is_admin() reads profiles. SECURITY DEFINER alone may still
-- evaluate RLS on some setups; disable row_security inside the function.

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

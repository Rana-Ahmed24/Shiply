-- Enable realtime for delivery_matches (Supabase Dashboard may also require enabling the table)
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_matches;

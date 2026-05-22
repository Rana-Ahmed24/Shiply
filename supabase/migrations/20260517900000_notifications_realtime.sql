-- Enable Supabase Realtime for in-app notification bell
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

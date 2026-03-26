-- LekkaWrzuta Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create the links table
CREATE TABLE IF NOT EXISTS public.links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'Mój plik',
    description TEXT DEFAULT 'Kliknij przycisk aby pobrać plik.',
    url TEXT NOT NULL,
    file_size TEXT DEFAULT 'Nieznany',
    short_id TEXT UNIQUE NOT NULL,
    image_url TEXT,
    owner_token TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_permanent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_links_short_id ON public.links(short_id);
CREATE INDEX IF NOT EXISTS idx_links_user_id ON public.links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON public.links(created_at);

-- Enable Row Level Security
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Anyone can read links
CREATE POLICY "Anyone can read links"
    ON public.links FOR SELECT TO anon, authenticated USING (true);

-- Anyone can create links
CREATE POLICY "Anyone can create links"
    ON public.links FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Anyone can delete their own links (verified by owner_token or user_id)
CREATE POLICY "Anyone can delete links"
    ON public.links FOR DELETE TO anon, authenticated USING (true);

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can upload files" ON storage.objects
    FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'files');

CREATE POLICY "Anyone can read files" ON storage.objects
    FOR SELECT TO anon, authenticated USING (bucket_id = 'files');

CREATE POLICY "Anyone can delete own files" ON storage.objects
    FOR DELETE TO anon, authenticated USING (bucket_id = 'files');

-- Auto-delete non-permanent links after 48 hours
-- Run this as a cron job or pg_cron extension:
-- SELECT cron.schedule('cleanup-expired-links', '0 */6 * * *',
--   $$DELETE FROM public.links WHERE is_permanent = false AND created_at < NOW() - INTERVAL '48 hours'$$
-- );

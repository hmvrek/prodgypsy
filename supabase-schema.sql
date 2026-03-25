-- GypsyCFG Database Schema
-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard -> SQL Editor)

-- Create the links table
CREATE TABLE IF NOT EXISTS public.links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'My Link',
    description TEXT DEFAULT 'Click the button below to access your content.',
    url TEXT NOT NULL,
    file_size TEXT DEFAULT 'Unknown',
    short_id TEXT UNIQUE NOT NULL,
    image_url TEXT,
    owner_token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookups by short_id
CREATE INDEX IF NOT EXISTS idx_links_short_id ON public.links(short_id);

-- Enable Row Level Security
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read links (needed for the download page)
CREATE POLICY "Anyone can read links"
    ON public.links
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Policy: Anyone can create links (no auth required)
CREATE POLICY "Anyone can create links"
    ON public.links
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Policy: Anyone can delete their own links (verified by owner_token in app code)
CREATE POLICY "Anyone can delete links"
    ON public.links
    FOR DELETE
    TO anon, authenticated
    USING (true);

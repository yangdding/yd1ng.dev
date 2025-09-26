-- Add published_at column to posts table
-- This script adds a published_at column to allow custom publication dates

-- Add the published_at column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'published_at'
    ) THEN
        ALTER TABLE public.posts 
        ADD COLUMN published_at DATE;
        
        -- Set default value for existing posts
        UPDATE public.posts 
        SET published_at = created_at::date 
        WHERE published_at IS NULL;
        
        -- Make the column NOT NULL with default value
        ALTER TABLE public.posts 
        ALTER COLUMN published_at SET NOT NULL,
        ALTER COLUMN published_at SET DEFAULT CURRENT_DATE;
    END IF;
END $$;

-- Update RLS policies to include published_at
-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Admin can manage all posts" ON public.posts;

-- Recreate policies with published_at support
CREATE POLICY "Anyone can view published posts" ON public.posts
    FOR SELECT USING (
        published = true AND 
        (published_at IS NULL OR published_at <= CURRENT_DATE)
    );

CREATE POLICY "Admin can manage all posts" ON public.posts
    FOR ALL USING (true);

-- Add comment to the column
COMMENT ON COLUMN public.posts.published_at IS 'Custom publication date for posts';



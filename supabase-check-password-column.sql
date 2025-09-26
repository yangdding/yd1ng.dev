-- Check if password column exists in posts table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name = 'password';

-- If the above query returns no results, the password column doesn't exist
-- Run the following to add it:

-- Add password column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'password'
    ) THEN
        ALTER TABLE posts ADD COLUMN password TEXT;
        RAISE NOTICE 'Added password column to posts table';
    ELSE
        RAISE NOTICE 'Password column already exists in posts table';
    END IF;
END $$;



-- Add resource_description column to projects table
-- This column stores the detailed description of how resources will be used

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS resource_description TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.projects.resource_description IS 'Detailed description of how required resources will be utilized and any specific requirements';

-- Update timestamps for existing rows
UPDATE public.projects
SET updated_at = NOW()
WHERE updated_at IS NULL;

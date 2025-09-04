-- Fix key_notes column naming inconsistency
-- The migration 006 created key_issue_reason but the code expects key_notes
-- Rename the column to match the code expectations

ALTER TABLE public.comics RENAME COLUMN key_issue_reason TO key_notes;

-- Update the constraint name to match
ALTER TABLE public.comics DROP CONSTRAINT IF EXISTS comics_key_issue_reason_length;
ALTER TABLE public.comics ADD CONSTRAINT comics_key_notes_length CHECK (char_length(key_notes) <= 500);
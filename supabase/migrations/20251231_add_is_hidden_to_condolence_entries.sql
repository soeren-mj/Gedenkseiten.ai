-- Add is_hidden field to condolence_entries table
-- Allows admins and entry owners to hide entries from public view

ALTER TABLE condolence_entries ADD COLUMN is_hidden BOOLEAN DEFAULT false;

-- Add index for filtering hidden entries
CREATE INDEX idx_condolence_entries_is_hidden ON condolence_entries(is_hidden);

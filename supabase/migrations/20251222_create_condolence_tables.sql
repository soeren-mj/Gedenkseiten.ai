-- ============================================
-- Kondolenzbuch Tables for Gedenkseiten.ai
-- Created: 2024-12-22
-- ============================================

-- condolence_books (1:1 with Memorial)
-- Stores the cover configuration for each memorial's condolence book
CREATE TABLE IF NOT EXISTS condolence_books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE UNIQUE,
  cover_type VARCHAR(20) NOT NULL CHECK (cover_type IN ('color', 'preset', 'custom')),
  cover_value TEXT NOT NULL, -- hex color code, preset name, or image URL
  cover_title TEXT NOT NULL,
  text_color VARCHAR(10) DEFAULT 'white' CHECK (text_color IN ('white', 'black')),
  show_profile BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- condolence_entries
-- Stores individual entries in the condolence book
-- Each user can only have ONE entry per book (UNIQUE constraint)
CREATE TABLE IF NOT EXISTS condolence_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES condolence_books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  is_read_by_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, user_id)
);

-- condolence_entry_images
-- Stores images attached to condolence entries (max 12 per entry)
CREATE TABLE IF NOT EXISTS condolence_entry_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES condolence_entries(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_condolence_books_memorial ON condolence_books(memorial_id);
CREATE INDEX IF NOT EXISTS idx_condolence_entries_book ON condolence_entries(book_id);
CREATE INDEX IF NOT EXISTS idx_condolence_entries_user ON condolence_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_condolence_entries_unread ON condolence_entries(book_id, is_read_by_admin) WHERE is_read_by_admin = false;
CREATE INDEX IF NOT EXISTS idx_condolence_entry_images_entry ON condolence_entry_images(entry_id);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE condolence_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE condolence_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE condolence_entry_images ENABLE ROW LEVEL SECURITY;

-- ============================================
-- condolence_books Policies
-- ============================================

-- Anyone can read condolence books (for public memorials)
CREATE POLICY "condolence_books_select_policy" ON condolence_books
  FOR SELECT USING (true);

-- Only memorial creator can insert/update/delete condolence book
CREATE POLICY "condolence_books_insert_policy" ON condolence_books
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memorials
      WHERE memorials.id = memorial_id
      AND memorials.creator_id = auth.uid()
    )
  );

CREATE POLICY "condolence_books_update_policy" ON condolence_books
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memorials
      WHERE memorials.id = memorial_id
      AND memorials.creator_id = auth.uid()
    )
  );

CREATE POLICY "condolence_books_delete_policy" ON condolence_books
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM memorials
      WHERE memorials.id = memorial_id
      AND memorials.creator_id = auth.uid()
    )
  );

-- ============================================
-- condolence_entries Policies
-- ============================================

-- Anyone can read entries (post-moderation: visible immediately)
CREATE POLICY "condolence_entries_select_policy" ON condolence_entries
  FOR SELECT USING (true);

-- Authenticated users can insert their own entry
CREATE POLICY "condolence_entries_insert_policy" ON condolence_entries
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- Users can update their own entries
CREATE POLICY "condolence_entries_update_own_policy" ON condolence_entries
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- Memorial admins can update any entry (for is_read_by_admin)
CREATE POLICY "condolence_entries_update_admin_policy" ON condolence_entries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM condolence_books cb
      JOIN memorials m ON m.id = cb.memorial_id
      WHERE cb.id = book_id
      AND m.creator_id = auth.uid()
    )
  );

-- Users can delete their own entries
CREATE POLICY "condolence_entries_delete_own_policy" ON condolence_entries
  FOR DELETE USING (
    auth.uid() = user_id
  );

-- Memorial admins can delete any entry
CREATE POLICY "condolence_entries_delete_admin_policy" ON condolence_entries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM condolence_books cb
      JOIN memorials m ON m.id = cb.memorial_id
      WHERE cb.id = book_id
      AND m.creator_id = auth.uid()
    )
  );

-- ============================================
-- condolence_entry_images Policies
-- ============================================

-- Anyone can read images
CREATE POLICY "condolence_entry_images_select_policy" ON condolence_entry_images
  FOR SELECT USING (true);

-- Entry owner can insert images
CREATE POLICY "condolence_entry_images_insert_policy" ON condolence_entry_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM condolence_entries ce
      WHERE ce.id = entry_id
      AND ce.user_id = auth.uid()
    )
  );

-- Entry owner can update images (for reordering)
CREATE POLICY "condolence_entry_images_update_policy" ON condolence_entry_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM condolence_entries ce
      WHERE ce.id = entry_id
      AND ce.user_id = auth.uid()
    )
  );

-- Entry owner can delete images
CREATE POLICY "condolence_entry_images_delete_policy" ON condolence_entry_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM condolence_entries ce
      WHERE ce.id = entry_id
      AND ce.user_id = auth.uid()
    )
  );

-- ============================================
-- Updated_at Trigger
-- ============================================

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_condolence_books_updated_at
  BEFORE UPDATE ON condolence_books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_condolence_entries_updated_at
  BEFORE UPDATE ON condolence_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

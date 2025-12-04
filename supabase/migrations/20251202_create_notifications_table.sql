-- Migration: Create notifications table for user notifications
-- Supports multiple notification types for future extensibility (reactions, kondolenz, beitrag)

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memorial_id UUID REFERENCES memorials(id) ON DELETE CASCADE,

  -- Notification metadata
  type TEXT NOT NULL CHECK (type IN ('reaction', 'kondolenz', 'beitrag')),

  -- Actor info (who triggered the notification)
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT,           -- Cached for display even if user deleted
  actor_avatar_url TEXT,     -- Cached for display

  -- Reaction-specific data (for type = 'reaction')
  reaction_types TEXT[],     -- Array of reaction types: ['liebe', 'kerze']
  reaction_count INTEGER DEFAULT 1,

  -- State
  is_read BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread ON notifications(recipient_id, is_read, created_at DESC) WHERE NOT is_read;
CREATE INDEX IF NOT EXISTS idx_notifications_memorial_id ON notifications(memorial_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
-- Index for finding existing notifications from same actor within 24h (for grouping)
CREATE INDEX IF NOT EXISTS idx_notifications_grouping ON notifications(recipient_id, memorial_id, actor_id, type, created_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can only see their own notifications
CREATE POLICY "notifications_select" ON notifications FOR SELECT
TO authenticated
USING (auth.uid() = recipient_id);

-- INSERT: System/API can insert (no direct user insert needed, handled via API)
-- We allow insert if the recipient is a valid user and the inserter is authenticated
CREATE POLICY "notifications_insert" ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Users can mark their own notifications as read
CREATE POLICY "notifications_update" ON notifications FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

-- DELETE: Users can delete their own notifications
CREATE POLICY "notifications_delete" ON notifications FOR DELETE
TO authenticated
USING (auth.uid() = recipient_id);

-- Add comments for documentation
COMMENT ON TABLE notifications IS 'User notifications for memorial activity (reactions, kondolenz, beitrag)';
COMMENT ON COLUMN notifications.type IS 'Notification type: reaction, kondolenz, beitrag';
COMMENT ON COLUMN notifications.actor_name IS 'Cached actor name for display even if user is deleted';
COMMENT ON COLUMN notifications.reaction_types IS 'Array of reaction types for grouped reaction notifications';
COMMENT ON COLUMN notifications.reaction_count IS 'Total count of reactions in this grouped notification';

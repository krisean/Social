-- Create VIBox Queue table with analytics
CREATE TABLE IF NOT EXISTS vibox_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Track Information
  track_id TEXT NOT NULL,
  track_title TEXT NOT NULL,
  track_artist TEXT NOT NULL,
  track_url TEXT NOT NULL,
  track_genre TEXT,
  track_duration INTEGER, -- in seconds
  primary_vibe TEXT,
  secondary_vibe TEXT,
  
  -- Queue Management
  position INTEGER,
  is_played BOOLEAN DEFAULT false,
  played_at TIMESTAMP,
  
  -- User Tracking
  added_by TEXT NOT NULL,
  added_by_user_id UUID, -- Link to auth.users if available
  added_at TIMESTAMP DEFAULT now(),
  
  -- Analytics Columns
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  user_agent TEXT,
  ip_address INET,
  session_id TEXT,
  
  -- Engagement Metrics
  time_in_queue INTEGER, -- seconds from added to played
  skip_count INTEGER DEFAULT 0, -- how many times skipped
  was_skipped BOOLEAN DEFAULT false,
  play_duration INTEGER, -- actual seconds played (vs track duration)
  completion_percentage DECIMAL(5,2), -- % of track played
  
  -- Context
  queue_length_when_added INTEGER, -- how many songs were in queue when added
  time_of_day TIME,
  day_of_week INTEGER, -- 0-6 for Sunday-Saturday
  
  -- Metadata
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_vibox_queue_position ON vibox_queue(position) WHERE NOT is_played;
CREATE INDEX idx_vibox_queue_added_at ON vibox_queue(added_at);
CREATE INDEX idx_vibox_queue_is_played ON vibox_queue(is_played);
CREATE INDEX idx_vibox_queue_added_by ON vibox_queue(added_by);
CREATE INDEX idx_vibox_queue_track_genre ON vibox_queue(track_genre);
CREATE INDEX idx_vibox_queue_primary_vibe ON vibox_queue(primary_vibe);
CREATE INDEX idx_vibox_queue_day_of_week ON vibox_queue(day_of_week);
CREATE INDEX idx_vibox_queue_time_of_day ON vibox_queue(time_of_day);

-- Function to automatically update position when new items are added
CREATE OR REPLACE FUNCTION update_vibox_queue_position()
RETURNS TRIGGER AS $$
BEGIN
  -- Set position to the end of the queue
  NEW.position := (
    SELECT COALESCE(MAX(position), 0) + 1
    FROM vibox_queue
    WHERE NOT is_played
  );
  
  -- Set time of day and day of week
  NEW.time_of_day := CURRENT_TIME;
  NEW.day_of_week := EXTRACT(DOW FROM CURRENT_TIMESTAMP);
  
  -- Set queue length when added
  NEW.queue_length_when_added := (
    SELECT COUNT(*)
    FROM vibox_queue
    WHERE NOT is_played
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update position on insert
CREATE TRIGGER trigger_update_vibox_queue_position
  BEFORE INSERT ON vibox_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_vibox_queue_position();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vibox_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on update
CREATE TRIGGER trigger_update_vibox_queue_updated_at
  BEFORE UPDATE ON vibox_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_vibox_queue_updated_at();

-- Function to calculate time in queue when marked as played
CREATE OR REPLACE FUNCTION calculate_vibox_queue_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_played = true AND OLD.is_played = false THEN
    NEW.played_at := now();
    NEW.time_in_queue := EXTRACT(EPOCH FROM (now() - NEW.added_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate metrics when played
CREATE TRIGGER trigger_calculate_vibox_queue_metrics
  BEFORE UPDATE ON vibox_queue
  FOR EACH ROW
  EXECUTE FUNCTION calculate_vibox_queue_metrics();

-- Enable Row Level Security
ALTER TABLE vibox_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read the queue
CREATE POLICY "Anyone can view queue"
  ON vibox_queue FOR SELECT
  USING (true);

-- Policy: Anyone can add to queue
CREATE POLICY "Anyone can add to queue"
  ON vibox_queue FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can update queue (for host controls)
CREATE POLICY "Anyone can update queue"
  ON vibox_queue FOR UPDATE
  USING (true);

-- Policy: Anyone can delete from queue (for host controls)
CREATE POLICY "Anyone can delete from queue"
  ON vibox_queue FOR DELETE
  USING (true);

-- Create analytics view for easy querying
CREATE OR REPLACE VIEW vibox_queue_analytics AS
SELECT
  track_genre,
  primary_vibe,
  secondary_vibe,
  COUNT(*) as total_plays,
  AVG(time_in_queue) as avg_time_in_queue,
  AVG(completion_percentage) as avg_completion,
  SUM(CASE WHEN was_skipped THEN 1 ELSE 0 END) as skip_count,
  AVG(queue_length_when_added) as avg_queue_length,
  day_of_week,
  EXTRACT(HOUR FROM time_of_day) as hour_of_day
FROM vibox_queue
WHERE is_played = true
GROUP BY track_genre, primary_vibe, secondary_vibe, day_of_week, EXTRACT(HOUR FROM time_of_day);

-- Create popular tracks view
CREATE OR REPLACE VIEW vibox_popular_tracks AS
SELECT
  track_title,
  track_artist,
  track_genre,
  primary_vibe,
  secondary_vibe,
  COUNT(*) as play_count,
  AVG(completion_percentage) as avg_completion,
  SUM(CASE WHEN was_skipped THEN 1 ELSE 0 END) as skip_count,
  AVG(time_in_queue) as avg_wait_time
FROM vibox_queue
WHERE is_played = true
GROUP BY track_title, track_artist, track_genre, primary_vibe, secondary_vibe
ORDER BY play_count DESC;

-- Create user engagement view
CREATE OR REPLACE VIEW vibox_user_engagement AS
SELECT
  added_by,
  COUNT(*) as songs_added,
  AVG(time_in_queue) as avg_wait_time,
  COUNT(DISTINCT DATE(added_at)) as active_days,
  MIN(added_at) as first_song_added,
  MAX(added_at) as last_song_added
FROM vibox_queue
GROUP BY added_by
ORDER BY songs_added DESC;

-- Create time-based analytics view
CREATE OR REPLACE VIEW vibox_time_analytics AS
SELECT
  day_of_week,
  EXTRACT(HOUR FROM time_of_day) as hour,
  COUNT(*) as song_count,
  AVG(queue_length_when_added) as avg_queue_length,
  COUNT(DISTINCT added_by) as unique_users
FROM vibox_queue
GROUP BY day_of_week, EXTRACT(HOUR FROM time_of_day)
ORDER BY day_of_week, hour;

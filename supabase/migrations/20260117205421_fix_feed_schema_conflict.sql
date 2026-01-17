-- Fix feed schema conflict by dropping existing tables and recreating
-- This resolves the issue where feed_posts already exists

-- Drop existing feed tables if they exist
DROP TABLE IF EXISTS feed_posts CASCADE;
DROP TABLE IF EXISTS feed_users CASCADE;
DROP TABLE IF EXISTS feed_likes CASCADE;

-- Now the feed schema migration should work
-- The actual feed schema will be created by the original migration
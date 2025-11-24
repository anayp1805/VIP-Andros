-- Migration 004: Add Lodge-Specific Fields
-- Date: 2024-11-24
-- Description: Adds columns for lodge profiles including rooms, amenities, policies, booking links, etc.
-- This enables the lodge/accommodation business type with comprehensive profile management.

-- Add new lodge-specific columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS external_booking_link TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS room_types JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS check_in_time TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS check_out_time TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cancellation_policy TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS minimum_stay TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS house_rules TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS story_image TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_business_type ON users(business_type);
CREATE INDEX IF NOT EXISTS idx_users_external_booking_link ON users(external_booking_link) WHERE external_booking_link IS NOT NULL;

-- Add comments to document the schema
COMMENT ON COLUMN users.tagline IS 'Short marketing tagline for lodges (e.g., "Island tranquility meets effortless adventure")';
COMMENT ON COLUMN users.external_booking_link IS 'URL to external booking system (ResNexus, Cloudbeds, Airbnb, etc.)';
COMMENT ON COLUMN users.room_types IS 'JSONB array of room type objects with structure: {id, name, description, maxOccupancy, bedTypes, nightlyRate, amenities[], images[]}';
COMMENT ON COLUMN users.amenities IS 'Array of lodge amenity strings (e.g., Free WiFi, Pool, Restaurant, etc.)';
COMMENT ON COLUMN users.check_in_time IS 'Check-in time (e.g., "3:00 PM" or "After 3:00 PM")';
COMMENT ON COLUMN users.check_out_time IS 'Check-out time (e.g., "11:00 AM" or "Before 11:00 AM")';
COMMENT ON COLUMN users.cancellation_policy IS 'Cancellation policy text (multi-line supported)';
COMMENT ON COLUMN users.minimum_stay IS 'Minimum stay requirement (e.g., "3 nights" or "No minimum")';
COMMENT ON COLUMN users.house_rules IS 'House rules text (multi-line supported)';
COMMENT ON COLUMN users.story_image IS 'URL or base64 image for the "Our Story" section';

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN (
  'tagline', 'external_booking_link', 'room_types', 'amenities',
  'check_in_time', 'check_out_time', 'cancellation_policy',
  'minimum_stay', 'house_rules', 'story_image'
)
ORDER BY column_name;

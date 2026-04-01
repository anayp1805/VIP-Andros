-- Migration 003b: Add business_type column
-- Date: 2024-11-24
-- Description: Adds business_type column to users table to distinguish between activity providers and lodges
-- This should be run after 003 and before 004

ALTER TABLE users ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'activity';

COMMENT ON COLUMN users.business_type IS 'Type of business: activity (tour/excursion provider) or lodge (accommodation provider)';

-- Migration 004b: Add Missing Business Columns
-- Date: 2024-11-24
-- Description: Adds missing columns that the lodge profile form needs

-- Add missing business-related columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_description TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_story TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_images TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS blog_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rates_info TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS planning_info TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS policies TEXT;

-- Add comments
COMMENT ON COLUMN users.business_description IS 'Detailed description of the business/lodge';
COMMENT ON COLUMN users.business_story IS 'The story behind the business';
COMMENT ON COLUMN users.business_images IS 'Array of image URLs for the business';
COMMENT ON COLUMN users.location IS 'Business location/address';
COMMENT ON COLUMN users.contact_email IS 'Contact email for the business';
COMMENT ON COLUMN users.contact_phone IS 'Contact phone number';
COMMENT ON COLUMN users.contact_address IS 'Physical contact address';
COMMENT ON COLUMN users.website IS 'Business website URL';
COMMENT ON COLUMN users.blog_url IS 'Blog URL';
COMMENT ON COLUMN users.rates_info IS 'Information about rates and pricing';
COMMENT ON COLUMN users.planning_info IS 'Planning and trip information';
COMMENT ON COLUMN users.policies IS 'General policies text';

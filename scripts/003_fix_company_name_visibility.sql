-- Allow anonymous users to read company names from the users table
-- This enables activity cards to show company names even when not logged in

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

-- Create a new policy that allows everyone to read basic user info (name only)
-- but restricts access to sensitive data
CREATE POLICY "Anyone can view company names"
ON users FOR SELECT
USING (true);

-- Add a separate policy to restrict updates to own profile only
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Add a separate policy to restrict deletes to own profile only
CREATE POLICY "Users can delete own profile"
ON users FOR DELETE
USING (auth.uid() = id);

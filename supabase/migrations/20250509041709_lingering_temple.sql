/*
  # Add country information to profiles

  1. Changes
    - Add country_code column to profiles table
    - Add country_name column to profiles table
    - Update existing constraints and indexes
  
  2. Notes
    - Defaults to India for existing records
    - Maintains data integrity with NOT NULL constraints
*/

ALTER TABLE profiles
ADD COLUMN country_code text NOT NULL DEFAULT 'IN',
ADD COLUMN country_name text NOT NULL DEFAULT 'India';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_country_code_idx ON profiles (country_code);
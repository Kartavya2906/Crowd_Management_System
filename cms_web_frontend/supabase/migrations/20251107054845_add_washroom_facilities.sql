/*
  # Add Washroom Facilities Table

  1. New Tables
    - `washroom_facilities`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key)
      - `name` (text) - Washroom name/location
      - `gender` (text) - male/female/unisex
      - `floor_level` (text) - Optional floor/level info
      - `capacity` (integer) - Number of stalls/urinals
      - `availability_status` (text) - available/occupied/maintenance
      - `location_details` (text) - Detailed location description
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on washroom_facilities table
    - Add policies for all operations
*/

CREATE TABLE IF NOT EXISTS washroom_facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'unisex')),
  floor_level text,
  capacity integer NOT NULL DEFAULT 1,
  availability_status text DEFAULT 'available' CHECK (availability_status IN ('available', 'occupied', 'maintenance')),
  location_details text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE washroom_facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on washroom_facilities"
  ON washroom_facilities FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert dummy washroom data
WITH evt AS (
  SELECT e.id FROM events e
  JOIN organizers o ON e.organizer_id = o.id
  WHERE o.organizer_id = 'admin123'
  LIMIT 1
)
INSERT INTO washroom_facilities (event_id, name, gender, floor_level, capacity, availability_status, location_details)
SELECT id, 'Main Male Washroom', 'male', 'Ground Floor', 8, 'available', 'Near the main entrance, fully equipped with 8 stalls' FROM evt
UNION ALL
SELECT id, 'Main Female Washroom', 'female', 'Ground Floor', 10, 'available', 'Near the main entrance, fully equipped with 10 stalls' FROM evt
UNION ALL
SELECT id, 'Accessible Unisex WC', 'unisex', 'Ground Floor', 2, 'available', 'Wheelchair accessible washrooms near parking' FROM evt
UNION ALL
SELECT id, 'VIP Male Lounge', 'male', '1st Floor', 4, 'occupied', 'Premium washroom facilities on first floor' FROM evt
UNION ALL
SELECT id, 'VIP Female Lounge', 'female', '1st Floor', 4, 'available', 'Premium washroom facilities on first floor' FROM evt
UNION ALL
SELECT id, 'Food Court Male', 'male', 'Ground Floor', 6, 'maintenance', 'Washroom facility near food court area' FROM evt
UNION ALL
SELECT id, 'Food Court Female', 'female', 'Ground Floor', 6, 'available', 'Washroom facility near food court area' FROM evt;

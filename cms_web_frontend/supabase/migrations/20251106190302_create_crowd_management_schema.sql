/*
  # Crowd Management System Database Schema

  1. New Tables
    - `organizers`
      - `id` (uuid, primary key)
      - `organizer_id` (text, unique) - Login ID for organizers
      - `password_hash` (text) - Hashed password
      - `name` (text) - Organizer name
      - `email` (text) - Contact email
      - `created_at` (timestamptz)
    
    - `events`
      - `id` (uuid, primary key)
      - `organizer_id` (uuid, foreign key)
      - `name` (text) - Event name
      - `location` (text) - Event location
      - `date` (date) - Event date
      - `attendees_count` (integer) - Number of attendees
      - `status` (text) - active/completed
      - `created_at` (timestamptz)
    
    - `zones`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key)
      - `name` (text) - Zone name
      - `capacity` (integer) - Maximum capacity
      - `current_density` (numeric) - People per square meter
      - `density_status` (text) - crowded/moderate/low
      - `image_url` (text) - Uploaded image URL
      - `last_updated` (timestamptz)
      - `created_at` (timestamptz)
    
    - `lost_persons`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key)
      - `name` (text) - Lost person name
      - `age` (integer)
      - `gender` (text)
      - `photo_url` (text)
      - `last_seen_location` (text)
      - `last_seen_time` (timestamptz)
      - `description` (text)
      - `reporter_name` (text)
      - `reporter_phone` (text)
      - `status` (text) - missing/found
      - `created_at` (timestamptz)
    
    - `medical_facilities`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key)
      - `facility_name` (text)
      - `facility_type` (text) - hospital/clinic/first-aid
      - `contact_number` (text)
      - `address` (text)
      - `created_at` (timestamptz)
    
    - `emergency_exits`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key)
      - `exit_name` (text)
      - `location` (text)
      - `status` (text) - crowded/moderate/clear
      - `last_updated` (timestamptz)
      - `created_at` (timestamptz)
    
    - `feedback`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key)
      - `rating` (integer) - 1-5 stars
      - `category` (text) - general/safety/navigation/facilities/emergency
      - `comment` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated organizers to manage their events
*/

-- Create organizers table
CREATE TABLE IF NOT EXISTS organizers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid REFERENCES organizers(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text NOT NULL,
  date date NOT NULL,
  attendees_count integer DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Create zones table
CREATE TABLE IF NOT EXISTS zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  capacity integer NOT NULL,
  current_density numeric DEFAULT 0,
  density_status text DEFAULT 'low',
  image_url text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create lost_persons table
CREATE TABLE IF NOT EXISTS lost_persons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer,
  gender text,
  photo_url text,
  last_seen_location text,
  last_seen_time timestamptz,
  description text,
  reporter_name text,
  reporter_phone text,
  status text DEFAULT 'missing',
  created_at timestamptz DEFAULT now()
);

-- Create medical_facilities table
CREATE TABLE IF NOT EXISTS medical_facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  facility_name text NOT NULL,
  facility_type text NOT NULL,
  contact_number text NOT NULL,
  address text,
  created_at timestamptz DEFAULT now()
);

-- Create emergency_exits table
CREATE TABLE IF NOT EXISTS emergency_exits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  exit_name text NOT NULL,
  location text NOT NULL,
  status text DEFAULT 'clear',
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  category text NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_exits ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies (permissive for now - would need proper auth in production)
CREATE POLICY "Allow all operations on organizers"
  ON organizers FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on events"
  ON events FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on zones"
  ON zones FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on lost_persons"
  ON lost_persons FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on medical_facilities"
  ON medical_facilities FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on emergency_exits"
  ON emergency_exits FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on feedback"
  ON feedback FOR ALL
  USING (true)
  WITH CHECK (true);

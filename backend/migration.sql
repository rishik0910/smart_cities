-- Fix complaints.ward_id type mismatch
ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_ward_id_fkey;
ALTER TABLE complaints ALTER COLUMN ward_id TYPE VARCHAR(100);

-- Add priority, severity, after_photo, votes, points columns
ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS priority      VARCHAR(20) DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS severity      VARCHAR(20) DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS after_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS votes         INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estimated_days INT,
  ADD COLUMN IF NOT EXISTS complaint_code VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS is_emergency  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS state         VARCHAR(100);

-- Points/rewards table
CREATE TABLE IF NOT EXISTS user_points (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id) ON DELETE CASCADE,
  points     INT DEFAULT 0,
  badges     TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Votes table (prevent double voting)
CREATE TABLE IF NOT EXISTS complaint_votes (
  id           SERIAL PRIMARY KEY,
  complaint_id INT REFERENCES complaints(id) ON DELETE CASCADE,
  user_id      INT REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE(complaint_id, user_id)
);

-- Translations table
CREATE TABLE IF NOT EXISTS translations (
  id       SERIAL PRIMARY KEY,
  lang     VARCHAR(10) NOT NULL,
  key      VARCHAR(200) NOT NULL,
  value    TEXT NOT NULL,
  UNIQUE(lang, key)
);

-- Generate WST codes for existing complaints
UPDATE complaints SET complaint_code = 'WST-' || LPAD(id::text, 4, '0') WHERE complaint_code IS NULL;

-- Index for nearby detection
CREATE INDEX IF NOT EXISTS idx_complaints_location ON complaints(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_complaints_priority  ON complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_emergency ON complaints(is_emergency);

-- Auth upgrade: Google sign-in, email OTP login, password reset
ALTER TABLE users
  ALTER COLUMN password DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS google_id          VARCHAR(64) UNIQUE,
  ADD COLUMN IF NOT EXISTS otp_code           VARCHAR(10),
  ADD COLUMN IF NOT EXISTS otp_expiry         TIMESTAMP,
  ADD COLUMN IF NOT EXISTS reset_token        VARCHAR(128),
  ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP,
  ADD COLUMN IF NOT EXISTS state              VARCHAR(100),
  ADD COLUMN IF NOT EXISTS district           VARCHAR(100),
  ADD COLUMN IF NOT EXISTS latitude           DECIMAL(9,6),
  ADD COLUMN IF NOT EXISTS longitude          DECIMAL(9,6);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users (email) WHERE email IS NOT NULL;

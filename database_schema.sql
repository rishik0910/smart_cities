-- Smart Waste Complaint Portal – Database Schema
-- Run this in PostgreSQL

-- Users (citizens)
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  phone       VARCHAR(15) UNIQUE NOT NULL,
  email       VARCHAR(150),
  password    TEXT, -- Nullable for Google sign-in
  role        VARCHAR(20) DEFAULT 'citizen', -- 'citizen' | 'officer' | 'admin'
  ward_id     INT,
  state       VARCHAR(100),
  district    VARCHAR(100),
  latitude    DECIMAL(9,6),
  longitude   DECIMAL(9,6),
  google_id   VARCHAR(64) UNIQUE,
  otp_code    VARCHAR(10),
  otp_expiry  TIMESTAMP,
  reset_token VARCHAR(128),
  reset_token_expiry TIMESTAMP,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users (email) WHERE email IS NOT NULL;

-- Wards (Warangal ward divisions)
CREATE TABLE wards (
  id          SERIAL PRIMARY KEY,
  ward_number INT UNIQUE NOT NULL,
  ward_name   VARCHAR(100) NOT NULL,
  officer_id  INT REFERENCES users(id),
  latitude    DECIMAL(9,6),
  longitude   DECIMAL(9,6)
);

-- Complaints
CREATE TABLE complaints (
  id            SERIAL PRIMARY KEY,
  user_id       INT REFERENCES users(id) ON DELETE SET NULL,
  ward_id       VARCHAR(100),
  category      VARCHAR(50) NOT NULL, -- 'garbage_dump' | 'missed_pickup' | 'overflowing_bin' | 'other'
  description   TEXT,
  photo_url     TEXT,
  latitude      DECIMAL(9,6) NOT NULL,
  longitude     DECIMAL(9,6) NOT NULL,
  address       TEXT,
  status        VARCHAR(30) DEFAULT 'pending', -- 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'rejected'
  assigned_to   INT REFERENCES users(id),
  resolved_at   TIMESTAMP,
  resolution_note TEXT,
  rating        INT,
  feedback      TEXT,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Status history (audit trail)
CREATE TABLE complaint_history (
  id            SERIAL PRIMARY KEY,
  complaint_id  INT REFERENCES complaints(id) ON DELETE CASCADE,
  changed_by    INT REFERENCES users(id),
  old_status    VARCHAR(30),
  new_status    VARCHAR(30),
  note          TEXT,
  changed_at    TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_complaints_ward    ON complaints(ward_id);
CREATE INDEX idx_complaints_status  ON complaints(status);
CREATE INDEX idx_complaints_user    ON complaints(user_id);
CREATE INDEX idx_complaints_officer ON complaints(assigned_to);

-- Seed Initial Districts
INSERT INTO wards (id, ward_number, ward_name, latitude, longitude) VALUES
  (1, 1, 'Adilabad', 19.6747, 78.5320),
  (2, 2, 'Bhadradri Kothagudem', 17.5549, 80.6174),
  (3, 3, 'Hanumakonda', 18.0125, 79.5630),
  (4, 4, 'Hyderabad', 17.3850, 78.4867),
  (5, 5, 'Jagtial', 18.7904, 78.9140),
  (6, 6, 'Jangaon', 17.7214, 79.1627),
  (7, 7, 'Jayashankar Bhupalpally', 18.4357, 79.8654),
  (8, 8, 'Jogulamba Gadwal', 16.2750, 77.8016),
  (9, 9, 'Kamareddy', 18.3229, 78.3411),
  (10, 10, 'Karimnagar', 18.4386, 79.1288),
  (11, 11, 'Khammam', 17.2473, 80.1514),
  (12, 12, 'Kumuram Bheem Asifabad', 19.3621, 79.2882),
  (13, 13, 'Mahabubabad', 17.5966, 80.0124),
  (14, 14, 'Mahabubnagar', 16.7388, 77.9944),
  (15, 15, 'Mancherial', 18.8754, 79.4449),
  (16, 16, 'Medak', 18.0463, 78.2633),
  (17, 17, 'Medchal-Malkajgiri', 17.5401, 78.5376),
  (18, 18, 'Mulugu', 18.1911, 80.1784),
  (19, 19, 'Nagarkurnool', 16.4858, 78.5701),
  (20, 20, 'Nalgonda', 17.0575, 79.2684),
  (21, 21, 'Narayanpet', 16.7444, 77.4981),
  (22, 22, 'Nirmal', 19.0964, 78.3424),
  (23, 23, 'Nizamabad', 18.6725, 78.0941),
  (24, 24, 'Peddapalli', 18.6186, 79.3822),
  (25, 25, 'Rajanna Sircilla', 18.3949, 78.8241),
  (26, 26, 'Rangareddy', 17.2000, 78.4333),
  (27, 27, 'Sangareddy', 17.6193, 78.0818),
  (28, 28, 'Siddipet', 18.1018, 78.8520),
  (29, 29, 'Suryapet', 17.1353, 79.6236),
  (30, 30, 'Vikarabad', 17.3364, 77.9048),
  (31, 31, 'Wanaparthy', 16.3624, 78.0627),
  (32, 32, 'Warangal', 17.9693, 79.6000),
  (33, 33, 'Yadadri Bhuvanagiri', 17.5113, 78.8893)
ON CONFLICT (ward_number) DO NOTHING;

SELECT setval(pg_get_serial_sequence('wards', 'id'), COALESCE(MAX(id), 1)) FROM wards;

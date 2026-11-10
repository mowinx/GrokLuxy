-- Luxy Affiliate System Schema
-- Run this in Supabase SQL Editor

-- Affiliates table
CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

-- Car owners (referred users)
CREATE TABLE car_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  affiliate_id UUID REFERENCES affiliates(id),
  referral_code TEXT,
  onboarding_status TEXT DEFAULT 'pending', -- pending, paid, approved
  payment_status TEXT DEFAULT 'unpaid', -- unpaid, paid
  payment_amount INTEGER DEFAULT 50000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Cars listed by owners
CREATE TABLE cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_owner_id UUID REFERENCES car_owners(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals tracking (optional detailed log)
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id),
  car_owner_id UUID REFERENCES car_owners(id),
  status TEXT DEFAULT 'clicked', -- clicked, signed_up, paid, completed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security) - configure policies in Supabase dashboard
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust as needed)
-- CREATE POLICY "Public can insert car_owners" ON car_owners FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Affiliates can view own referrals" ON car_owners FOR SELECT USING (affiliate_id = auth.uid());

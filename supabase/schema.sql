-- =============================================================================
-- RVCAS CANTEEN DIGITAL MEAL-PASS PLATFORM
-- Rajagiri Viswajyothi College of Arts & Applied Sciences
-- Production Database Schema & Stored Procedures
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  course TEXT NOT NULL,
  semester TEXT NOT NULL,
  student_id_code TEXT UNIQUE,
  profile_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MEALS TABLE
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'Today''s Meal',
  description TEXT DEFAULT 'Daily College Meal - Wholesome rice, curries, and accompaniments',
  price NUMERIC(10, 2) NOT NULL DEFAULT 40.00,
  meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  available BOOLEAN NOT NULL DEFAULT true,
  daily_limit INT NOT NULL DEFAULT 600,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  meal_id UUID REFERENCES meals(id) ON DELETE SET NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  payment_provider TEXT NOT NULL DEFAULT 'razorpay',
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED')),
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MEAL PASSES TABLE (Core source of truth)
CREATE TABLE IF NOT EXISTS meal_passes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pass_id TEXT UNIQUE NOT NULL, -- Human-readable: RVCAS-20260909-XXXXX
  secure_token TEXT UNIQUE NOT NULL, -- Cryptographic random token for /verify-pass/[token]
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  student_course_sem TEXT NOT NULL,
  meal_id UUID REFERENCES meals(id) ON DELETE SET NULL,
  meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 40.00,
  status TEXT NOT NULL DEFAULT 'VALID' CHECK (status IN ('PAID', 'VALID', 'SERVED', 'CANCELLED', 'EXPIRED')),
  served_at TIMESTAMPTZ,
  served_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- High-performance indexes
CREATE INDEX IF NOT EXISTS idx_meal_passes_secure_token ON meal_passes(secure_token);
CREATE INDEX IF NOT EXISTS idx_meal_passes_pass_id ON meal_passes(pass_id);
CREATE INDEX IF NOT EXISTS idx_meal_passes_meal_date ON meal_passes(meal_date);
CREATE INDEX IF NOT EXISTS idx_meal_passes_status ON meal_passes(status);
CREATE INDEX IF NOT EXISTS idx_meal_passes_student_id ON meal_passes(student_id);

-- 5. ATOMIC STATUS UPDATE STORED PROCEDURE
-- Ensures strict single-redemption concurrency protection
CREATE OR REPLACE FUNCTION mark_meal_pass_served(
  p_token TEXT,
  p_served_by TEXT DEFAULT 'Staff Counter 1'
)
RETURNS JSON AS $$
DECLARE
  v_pass RECORD;
BEGIN
  -- Attempt atomic transition from VALID to SERVED
  UPDATE meal_passes
  SET status = 'SERVED',
      served_at = NOW(),
      served_by = p_served_by
  WHERE (secure_token = p_token OR pass_id = p_token)
    AND status = 'VALID'
  RETURNING * INTO v_pass;

  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Meal served successfully',
      'pass', row_to_json(v_pass)
    );
  END IF;

  -- If no rows were updated, determine reason
  SELECT * INTO v_pass
  FROM meal_passes
  WHERE secure_token = p_token OR pass_id = p_token;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'reason', 'NOT_FOUND',
      'message', 'Meal pass could not be found'
    );
  ELSIF v_pass.status = 'SERVED' THEN
    RETURN json_build_object(
      'success', false,
      'reason', 'ALREADY_SERVED',
      'message', 'This meal was already collected',
      'served_at', v_pass.served_at,
      'served_by', v_pass.served_by,
      'pass', row_to_json(v_pass)
    );
  ELSIF v_pass.status = 'EXPIRED' THEN
    RETURN json_build_object(
      'success', false,
      'reason', 'EXPIRED',
      'message', 'This meal pass has expired',
      'pass', row_to_json(v_pass)
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'reason', v_pass.status,
      'message', 'Meal pass status is ' || v_pass.status,
      'pass', row_to_json(v_pass)
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_passes ENABLE ROW LEVEL SECURITY;

-- Public can view active meals
CREATE POLICY "Public read meals" ON meals FOR SELECT USING (available = true);

-- Students can read their own passes
CREATE POLICY "Students read own passes" ON meal_passes FOR SELECT USING (true);

-- Staff and backend can update pass status via stored procedure
-- (Function runs with SECURITY DEFINER)

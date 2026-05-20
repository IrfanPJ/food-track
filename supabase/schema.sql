-- FitTrack AI Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  weight DECIMAL(5,2) NOT NULL DEFAULT 70,
  height DECIMAL(5,2) NOT NULL DEFAULT 175,
  goal TEXT NOT NULL DEFAULT 'improve_fitness'
    CHECK (goal IN ('lose_weight', 'maintain', 'gain_muscle', 'improve_fitness')),
  calories_target INTEGER NOT NULL DEFAULT 2000,
  protein_target INTEGER NOT NULL DEFAULT 150,
  carbs_target INTEGER NOT NULL DEFAULT 200,
  fat_target INTEGER NOT NULL DEFAULT 65,
  water_target INTEGER NOT NULL DEFAULT 8,
  sleep_target INTEGER NOT NULL DEFAULT 8,
  workout_split TEXT NOT NULL DEFAULT 'push-pull-legs',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- FOODS (food database)
-- ============================================================
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  calories DECIMAL(8,2) NOT NULL DEFAULT 0,
  protein DECIMAL(8,2) NOT NULL DEFAULT 0,
  carbs DECIMAL(8,2) NOT NULL DEFAULT 0,
  fat DECIMAL(8,2) NOT NULL DEFAULT 0,
  serving_size DECIMAL(8,2) NOT NULL DEFAULT 100,
  serving_unit TEXT NOT NULL DEFAULT 'g',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own foods" ON foods FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- MEAL LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
  food_name TEXT NOT NULL,
  calories DECIMAL(8,2) NOT NULL DEFAULT 0,
  protein DECIMAL(8,2) NOT NULL DEFAULT 0,
  carbs DECIMAL(8,2) NOT NULL DEFAULT 0,
  fat DECIMAL(8,2) NOT NULL DEFAULT 0,
  quantity DECIMAL(8,2) NOT NULL DEFAULT 1,
  meal_type TEXT NOT NULL DEFAULT 'breakfast'
    CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout')),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  completed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own meal logs" ON meal_logs FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_meal_logs_user_date ON meal_logs(user_id, logged_at);

-- ============================================================
-- WORKOUTS
-- ============================================================
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'custom'
    CHECK (type IN ('push', 'pull', 'legs', 'full_body', 'cardio', 'rest', 'custom')),
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'missed')),
  notes TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own workouts" ON workouts FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_workouts_user_date ON workouts(user_id, scheduled_date);

-- ============================================================
-- EXERCISES
-- ============================================================
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sets INTEGER NOT NULL DEFAULT 3,
  reps INTEGER NOT NULL DEFAULT 10,
  weight DECIMAL(8,2) NOT NULL DEFAULT 0,
  rest_seconds INTEGER NOT NULL DEFAULT 90,
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage exercises of own workouts" ON exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workouts w
      WHERE w.id = exercises.workout_id
        AND w.user_id = auth.uid()
    )
  );

-- ============================================================
-- INVENTORY ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'g',
  low_stock_threshold DECIMAL(10,2) NOT NULL DEFAULT 100,
  category TEXT NOT NULL DEFAULT 'Other',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own inventory" ON inventory_items FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- SHOPPING ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS shopping_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'piece',
  completed BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL DEFAULT 'Other',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own shopping list" ON shopping_items FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- CHECKLIST ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'custom'
    CHECK (category IN ('meal', 'workout', 'water', 'sleep', 'supplement', 'custom')),
  completed BOOLEAN NOT NULL DEFAULT false,
  target_date DATE NOT NULL DEFAULT CURRENT_DATE,
  streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own checklist" ON checklist_items FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_checklist_user_date ON checklist_items(user_id, target_date);

-- ============================================================
-- PROGRESS LOGS (weight tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS progress_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own progress logs" ON progress_logs FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_progress_user_date ON progress_logs(user_id, logged_at);

-- ============================================================
-- FUNCTION: Auto-update profile updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

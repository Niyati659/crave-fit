-- Create daily_goals table
CREATE TABLE IF NOT EXISTS daily_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  target_calories INT DEFAULT 2000,
  target_protein INT DEFAULT 150,
  target_carbs INT DEFAULT 250,
  target_fats INT DEFAULT 65,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  meal_type VARCHAR(50) NOT NULL, -- breakfast, lunch, dinner, snack
  food_name VARCHAR(255) NOT NULL,
  calories INT NOT NULL,
  protein INT NOT NULL,
  carbs INT NOT NULL,
  fats INT NOT NULL,
  quantity DECIMAL(10, 2),
  unit VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create meal_history table for tracking progress over time
CREATE TABLE IF NOT EXISTS meal_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  total_calories INT DEFAULT 0,
  total_protein INT DEFAULT 0,
  total_carbs INT DEFAULT 0,
  total_fats INT DEFAULT 0,
  meals_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes for better query performance
CREATE INDEX idx_meals_user_date ON meals(user_id, date);
CREATE INDEX idx_daily_goals_user_date ON daily_goals(user_id, date);
CREATE INDEX idx_meal_history_user_date ON meal_history(user_id, date);

-- Enable Row Level Security
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own daily goals" ON daily_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily goals" ON daily_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily goals" ON daily_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own meals" ON meals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meals" ON meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals" ON meals
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own meal history" ON meal_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal history" ON meal_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal history" ON meal_history
  FOR UPDATE USING (auth.uid() = user_id);

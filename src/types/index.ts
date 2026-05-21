export interface Profile {
  id: string
  user_id: string
  name: string
  email: string
  avatar_url?: string
  weight: number
  height: number
  goal: 'lose_weight' | 'maintain' | 'gain_muscle' | 'improve_fitness'
  calories_target: number
  protein_target: number
  carbs_target: number
  fat_target: number
  water_target: number
  sleep_target: number
  workout_split: string
  created_at: string
  updated_at: string
}

export interface Food {
  id: string
  user_id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  serving_size: number
  serving_unit: string
  is_favorite: boolean
  created_at: string
}

export interface MealLog {
  id: string
  user_id: string
  food_id?: string
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  quantity: number
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout'
  logged_at: string
  notes?: string
  completed: boolean
}

export interface Workout {
  id: string
  user_id: string
  name: string
  type: 'push' | 'pull' | 'legs' | 'full_body' | 'cardio' | 'rest' | 'custom'
  scheduled_date: string
  status: 'pending' | 'in_progress' | 'completed' | 'missed'
  notes?: string
  duration_minutes?: number
  created_at: string
}

export interface Exercise {
  id: string
  workout_id: string
  name: string
  sets: number
  reps: number
  weight: number
  rest_seconds: number
  notes?: string
  order_index: number
}

export interface InventoryItem {
  id: string
  user_id: string
  name: string
  quantity: number
  unit: string
  low_stock_threshold: number
  category: string
  created_at: string
}

export interface ShoppingItem {
  id: string
  user_id: string
  name: string
  quantity: number
  unit: string
  completed: boolean
  category: string
  created_at: string
}

export interface ChecklistItem {
  id: string
  user_id: string
  title: string
  category: 'meal' | 'workout' | 'water' | 'sleep' | 'supplement' | 'custom'
  completed: boolean
  target_date: string
  streak: number
  created_at: string
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface ProgressLog {
  id: string
  user_id: string
  weight: number
  logged_at: string
  notes?: string
}

export interface MacroSummary {
  calories: number
  protein: number
  carbs: number
  fat: number
}

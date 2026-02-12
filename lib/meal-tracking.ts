export interface MealEntry {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  time: string // HH:MM format
  imageUrl?: string
  detectedFood?: string
}

export interface DailyGoals {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

export interface DailyProgress {
  date: string
  meals: MealEntry[]
  goals: DailyGoals
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  totalFiber: number
}

export const DEFAULT_DAILY_GOALS: DailyGoals = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
  fiber: 30,
}

export const MEAL_SUGGESTIONS: Record<string, MealEntry[]> = {
  protein: [
    {
      id: 'egg-boiled',
      name: 'Boiled Eggs (2)',
      calories: 155,
      protein: 13,
      carbs: 1.1,
      fat: 11,
      fiber: 0,
      time: '08:00',
      imageUrl: '/foods/eggs.jpg',
    },
    {
      id: 'chicken-breast',
      name: 'Grilled Chicken Breast (150g)',
      calories: 245,
      protein: 52,
      carbs: 0,
      fat: 3.2,
      fiber: 0,
      time: '12:00',
      imageUrl: '/foods/chicken-breast.jpg',
    },
    {
      id: 'greek-yogurt',
      name: 'Greek Yogurt (200g)',
      calories: 130,
      protein: 23,
      carbs: 3.6,
      fat: 0.7,
      fiber: 0,
      time: '15:00',
      imageUrl: '/foods/greek-yogurt.jpg',
    },
    {
      id: 'salmon',
      name: 'Grilled Salmon (150g)',
      calories: 280,
      protein: 39,
      carbs: 0,
      fat: 13,
      fiber: 0,
      time: '18:00',
      imageUrl: '/foods/salmon.jpg',
    },
    {
      id: 'lentils',
      name: 'Cooked Lentils (200g)',
      calories: 230,
      protein: 18,
      carbs: 40,
      fat: 0.8,
      fiber: 8,
      time: '12:00',
      imageUrl: '/foods/lentils.jpg',
    },
    {
      id: 'tuna',
      name: 'Tuna Can (100g)',
      calories: 99,
      protein: 22,
      carbs: 0,
      fat: 0.8,
      fiber: 0,
      time: '13:00',
      imageUrl: '/foods/tuna.jpg',
    },
  ],
  carbs: [
    {
      id: 'brown-rice',
      name: 'Brown Rice (150g cooked)',
      calories: 195,
      protein: 4.5,
      carbs: 43,
      fat: 1.6,
      fiber: 3.5,
      time: '12:00',
      imageUrl: '/foods/brown-rice.jpg',
    },
    {
      id: 'sweet-potato',
      name: 'Sweet Potato (200g)',
      calories: 180,
      protein: 4,
      carbs: 41,
      fat: 0.3,
      fiber: 6.6,
      time: '12:00',
      imageUrl: '/foods/sweet-potato.jpg',
    },
    {
      id: 'oats',
      name: 'Oatmeal (50g dry)',
      calories: 190,
      protein: 5.3,
      carbs: 34,
      fat: 5,
      fiber: 8,
      time: '08:00',
      imageUrl: '/foods/oats.jpg',
    },
    {
      id: 'banana',
      name: 'Banana (1 medium)',
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.3,
      fiber: 3.1,
      time: '15:00',
      imageUrl: '/foods/banana.jpg',
    },
    {
      id: 'whole-wheat-bread',
      name: 'Whole Wheat Bread (2 slices)',
      calories: 160,
      protein: 7,
      carbs: 28,
      fat: 2,
      fiber: 4,
      time: '08:00',
      imageUrl: '/foods/whole-wheat-bread.jpg',
    },
  ],
  fats: [
    {
      id: 'almonds',
      name: 'Almonds (30g)',
      calories: 170,
      protein: 6,
      carbs: 6,
      fat: 15,
      fiber: 3.5,
      time: '15:00',
      imageUrl: '/foods/almonds.jpg',
    },
    {
      id: 'avocado',
      name: 'Avocado (1/2)',
      calories: 120,
      protein: 1.5,
      carbs: 6,
      fat: 11,
      fiber: 5,
      time: '12:00',
      imageUrl: '/foods/avocado.jpg',
    },
    {
      id: 'olive-oil',
      name: 'Olive Oil (1 tbsp)',
      calories: 120,
      protein: 0,
      carbs: 0,
      fat: 14,
      fiber: 0,
      time: '12:00',
      imageUrl: '/foods/olive-oil.jpg',
    },
    {
      id: 'peanut-butter',
      name: 'Peanut Butter (2 tbsp)',
      calories: 190,
      protein: 8,
      carbs: 7,
      fat: 16,
      fiber: 2,
      time: '08:00',
      imageUrl: '/foods/peanut-butter.jpg',
    },
  ],
  fiber: [
    {
      id: 'broccoli',
      name: 'Broccoli (200g)',
      calories: 68,
      protein: 7.2,
      carbs: 13.6,
      fat: 0.8,
      fiber: 2.8,
      time: '18:00',
      imageUrl: '/foods/broccoli.jpg',
    },
    {
      id: 'spinach',
      name: 'Spinach (150g)',
      calories: 25,
      protein: 3,
      carbs: 3.6,
      fat: 0.4,
      fiber: 2.2,
      time: '12:00',
      imageUrl: '/foods/spinach.jpg',
    },
    {
      id: 'apple',
      name: 'Apple (1 medium)',
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3,
      fiber: 4.4,
      time: '15:00',
      imageUrl: '/foods/apple.jpg',
    },
    {
      id: 'chia-seeds',
      name: 'Chia Seeds (30g)',
      calories: 138,
      protein: 4.7,
      carbs: 12,
      fat: 8.7,
      fiber: 9.8,
      time: '08:00',
      imageUrl: '/foods/chia-seeds.jpg',
    },
  ],
  quick: [
    {
      id: 'protein-shake',
      name: 'Protein Shake',
      calories: 200,
      protein: 30,
      carbs: 15,
      fat: 2,
      fiber: 2,
      time: '10:00',
      imageUrl: '/foods/protein-shake.jpg',
    },
    {
      id: 'granola-bar',
      name: 'Protein Granola Bar',
      calories: 200,
      protein: 10,
      carbs: 25,
      fat: 7,
      fiber: 3,
      time: '15:00',
      imageUrl: '/foods/granola-bar.jpg',
    },
    {
      id: 'almonds-quick',
      name: 'Mixed Nuts (30g)',
      calories: 180,
      protein: 6,
      carbs: 7,
      fat: 16,
      fiber: 3.5,
      time: '15:00',
      imageUrl: '/foods/mixed-nuts.jpg',
    },
  ],
}

export function getSuggestedMeals(currentProgress: DailyProgress): Record<string, MealEntry[]> {
  const remaining = {
    protein: Math.max(0, currentProgress.goals.protein - currentProgress.totalProtein),
    carbs: Math.max(0, currentProgress.goals.carbs - currentProgress.totalCarbs),
    fat: Math.max(0, currentProgress.goals.fat - currentProgress.totalFat),
    fiber: Math.max(0, currentProgress.goals.fiber - currentProgress.totalFiber),
    calories: Math.max(0, currentProgress.goals.calories - currentProgress.totalCalories),
  }

  const suggestions: Record<string, MealEntry[]> = {}

  // Suggest protein if deficient
  if (remaining.protein > 20) {
    suggestions.protein = MEAL_SUGGESTIONS.protein
  }

  // Suggest carbs if deficient
  if (remaining.carbs > 30) {
    suggestions.carbs = MEAL_SUGGESTIONS.carbs
  }

  // Suggest fats if deficient
  if (remaining.fat > 15) {
    suggestions.fats = MEAL_SUGGESTIONS.fats
  }

  // Suggest fiber if deficient
  if (remaining.fiber > 5) {
    suggestions.fiber = MEAL_SUGGESTIONS.fiber
  }
// Always suggest quick options
  const topMeals = getTopMeals(currentProgress.meals, 4)

  suggestions.quick =
    topMeals.length > 0
      ? topMeals
      : MEAL_SUGGESTIONS.quick

  return suggestions

}

export function calculateProgress(meals: MealEntry[]): Omit<DailyProgress, 'date' | 'goals' | 'meals'> {
  return {
    totalCalories: meals.reduce((sum, m) => sum + m.calories, 0),
    totalProtein: meals.reduce((sum, m) => sum + m.protein, 0),
    totalCarbs: meals.reduce((sum, m) => sum + m.carbs, 0),
    totalFat: meals.reduce((sum, m) => sum + m.fat, 0),
    totalFiber: meals.reduce((sum, m) => sum + m.fiber, 0),
  }
}

export function getProgressPercentage(current: number, goal: number): number {
  if (goal === 0) return 0
  return Math.min(100, Math.round((current / goal) * 100))
}
// 🔥 NEW — Personalized Quick Meals
export function getTopMeals(
  meals: MealEntry[],
  limit = 4
): MealEntry[] {

  if (!meals.length) return []

  const freq: Record<string, number> = {}

  meals.forEach((meal) => {
    const key = meal.detectedFood || meal.name

    if (!freq[key]) freq[key] = 0
    freq[key]++
  })

  // Sort by frequency
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)

  // Return full meal objects
  return sorted.map(([name]) => {
    return meals.find(
      (m) =>
        (m.detectedFood || m.name) === name
    )!
  })
}

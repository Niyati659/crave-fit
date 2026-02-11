export interface Food {
  id: string
  name: string
  image: string
  healthScore: number
  calories: number
  carbs?: number
  protein: number
  fat?:number
  dietType?: string
  sugar: number
  category: string
  cravingMatch: string[]
  healthierAlternative?: string
  description: string
  healthierRecipe?: {
    name: string
    calories: number
    carbs?: number
    fat?: number
    protein: number
    sugar: number
    ingredients: string[]
    instructions?: string[]
    healthScore: number
  }
}

export const mockFoods: Food[] = [
  {
    id: '1',
    name: 'Crispy Fried Chicken',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c8d08f58?w=800&q=80',
    healthScore: 45,
    calories: 320,
    protein: 28,
    sugar: 0,
    category: 'Protein',
    cravingMatch: ['crispy', 'savory', 'energetic'],
    healthierAlternative: 'Crispy Baked Chicken Thighs',
    description:
      'Recommended because it satisfies your craving with a protein-rich option. Consider baking instead of frying for fewer calories.',
    healthierRecipe: {
      name: 'Air-Fried Crispy Chicken Thighs',
      calories: 240,
      protein: 32,
      sugar: 0,
      ingredients: [
        '2 Boneless chicken thighs',
        '1/4 cup Cornstarch',
        '1 tsp Paprika',
        '1 tsp Garlic powder',
        'Olive oil spray',
      ],
      instructions: [
        'Pat chicken dry and season.',
        'Coat lightly with cornstarch and spices.',
        'Air fry at 400°F for 15 minutes.',
        'Serve with lemon and fresh herbs.',
      ],
      healthScore: 72,
    },
  },
  {
    id: '2',
    name: 'Grilled Chicken Salad',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    healthScore: 85,
    calories: 280,
    protein: 35,
    sugar: 6,
    category: 'Salad',
    cravingMatch: ['light', 'energetic', 'balanced'],
    description:
      'Recommended because it satisfies your craving with lower calories and higher protein. A nutritious and filling choice.',
  },
  {
    id: '3',
    name: 'Double Cheeseburger',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    healthScore: 35,
    calories: 850,
    protein: 32,
    sugar: 12,
    category: 'Fast Food',
    cravingMatch: ['savory', 'heavy', 'comfort'],
    healthierAlternative: 'Grilled Chicken Avocado Burger',
    description: 'Deliciously high in calories and saturated fats. We recommend switching to our grilled chicken alternative for a protein boost without the heavy grease.',
    healthierRecipe: {
      name: 'Grilled Chicken Avocado Burger',
      calories: 420,
      protein: 45,
      sugar: 4,
      ingredients: [
        '1 Chicken breast',
        '1 Whole grain bun',
        '1/2 Avocado',
        '1/2 cup Baby spinach',
        '2 Tomato slices'
      ],
      instructions: [
        'Season chicken breast with salt, pepper, and garlic powder.',
        'Grill for 6-8 minutes per side until cooked through.',
        'Toast the whole grain bun lightly.',
        'Spread mashed avocado on the bottom bun.',
        'Layer chicken, spinach, and tomato.',
        'Serve with a side of mixed greens.'
      ],
      healthScore: 85
    }
  },
  {
    id: '4',
    name: 'Chocolate Brownie',
    image: 'https://images.unsplash.com/photo-1564356453-33303649514d?w=800&q=80',
    healthScore: 35,
    calories: 420,
    protein: 5,
    sugar: 45,
    category: 'Dessert',
    cravingMatch: ['sweet', 'stressed', 'chewy'],
    healthierAlternative: 'Dark Chocolate Avocado Mousse',
    description:
      'Recommended because it satisfies your sweet craving. Try a darker chocolate version with more cocoa for health benefits.',
    healthierRecipe: {
      name: 'Dark Chocolate Avocado Brownie Bites',
      calories: 180,
      protein: 8,
      sugar: 14,
      ingredients: [
        '1 Ripe avocado',
        '100g Dark chocolate (70% cacao)',
        '1 cup Almond flour',
        '1/4 cup Maple syrup',
        '2 Eggs',
        '1 tsp Vanilla extract',
      ],
      instructions: [
        'Blend avocado with melted chocolate.',
        'Mix in almond flour and maple syrup.',
        'Fold in eggs and vanilla.',
        'Bake at 350°F for 20 minutes.',
        'Enjoy your guilt-free treat!'
      ],
      healthScore: 68,
    },
  },
  {
    id: '5',
    name: 'Greek Yogurt Parfait',
    image: 'https://images.unsplash.com/photo-1504610926078-a1611febcad3?w=800&q=80',
    healthScore: 80,
    calories: 210,
    protein: 18,
    sugar: 18,
    category: 'Breakfast',
    cravingMatch: ['sweet', 'light', 'soft'],
    healthierRecipe: {
      name: 'Greek Yogurt Superfood Parfait',
      calories: 190,
      protein: 22,
      sugar: 8,
      ingredients: [
        '1 cup Greek yogurt (unsweetened)',
        '1/2 cup Fresh berries',
        '2 tbsp Toasted oats',
        '1 tsp Honey'
      ],
      instructions: [
        'Place half of the yogurt in a glass.',
        'Layer with half of the berries and oats.',
        'Repeat the layers and drizzle with honey.',
        'Enjoy a high-protein breakfast!'
      ],
      healthScore: 90
    },
    description:
      'Recommended because it balances your sweet tooth with protein and probiotics. A guilt-free indulgence.',
  },
  {
    id: '6',
    name: 'Cheesy Pizza Slice',
    image: 'https://images.unsplash.com/photo-1593560704721-fa7878a6d856?w=800&q=80',
    healthScore: 50,
    calories: 350,
    protein: 12,
    sugar: 2,
    category: 'Main',
    cravingMatch: ['chewy', 'savory', 'bored'],
    healthierAlternative: 'Whole Wheat Crust Pizza with Veggies',
    description:
      'Recommended because it satisfies your savory craving. Pair with a side salad to boost nutrition.',
    healthierRecipe: {
      name: 'Veggie-Loaded Whole Wheat Pizza',
      calories: 260,
      protein: 14,
      sugar: 3,
      ingredients: [
        '1 Whole wheat pizza dough',
        '1/2 cup Marinara sauce',
        '1 cup Part-skim mozzarella',
        'Selection of Bell peppers, mushrooms, spinach',
        'Fresh basil & olive oil',
      ],
      instructions: [
        'Spread marinara on whole wheat crust.',
        'Layer veggies and cheese.',
        'Bake at 425°F for 12-15 minutes.',
        'Top with fresh basil.',
      ],
      healthScore: 78,
    },
  },
  {
    id: '7',
    name: 'Classic Pepperoni Pizza',
    image: 'https://bhuaffcpzfeiqzheclrw.supabase.co/storage/v1/object/public/food_pics/pizza.jpg',
    healthScore: 55,
    calories: 285,
    protein: 12,
    sugar: 3,
    category: 'Main',
    cravingMatch: ['savory', 'chewy', 'comfort'],
    healthierAlternative: 'Cauliflower Crust Margherita Pizza',
    description: 'A classic favorite! For a healthier twist, try our cauliflower crust version which cuts down on carbs and processed meats.',
    healthierRecipe: {
      name: 'Cauliflower Crust Margherita Pizza',
      calories: 195,
      protein: 14,
      sugar: 2,
      ingredients: [
        '1 Cauliflower crust',
        '1/2 cup Organic tomato sauce',
        '1 cup Low-fat mozzarella cheese',
        'Handful of Fresh basil leaves',
        'Olive oil spray'
      ],
      instructions: [
        'Preheat oven to 425°F (220°C).',
        'Place cauliflower crust on a baking sheet.',
        'Spread a thin layer of tomato sauce over the crust.',
        'Sprinkle with mozzarella cheese.',
        'Bake for 12 minutes until the edges are golden brown.',
        'Garnish with fresh basil and enjoy!'
      ],
      healthScore: 88
    }
  },
  {
    id: '8',
    name: 'Loaded Breakfast Omelette',
    image: 'https://bhuaffcpzfeiqzheclrw.supabase.co/storage/v1/object/public/food_pics/omelette.jpg',
    healthScore: 78,
    calories: 240,
    protein: 18,
    sugar: 1,
    category: 'Breakfast',
    cravingMatch: ['savory', 'energetic', 'soft'],
    healthierAlternative: 'Super Green Protein Omelette',
    description: 'High in protein and very satisfying. This version uses fresh eggs and plenty of greens for a nutrient boost.',
    healthierRecipe: {
      name: 'Super Green Protein Omelette',
      calories: 180,
      protein: 20,
      sugar: 1,
      ingredients: [
        '2 Large free-range eggs',
        '1 cup Fresh baby spinach',
        '1 tbsp Feta cheese',
        'Fresh chives and parsley',
        'Olive oil spray'
      ],
      instructions: [
        'Beat 2 large eggs with a splash of water and a pinch of salt.',
        'Heat a non-stick pan over medium-low heat with a spray of olive oil.',
        'Pour eggs into the pan and let them set for 1 minute.',
        'Sprinkle fresh spinach and feta cheese over one half.',
        'Fold the omelette and cook for another 2 minutes until cheese melts.',
        'Serve with fresh herbs.'
      ],
      healthScore: 92
    }
  },
]

export function getRecommendedFoods(
  quizAnswers?: Record<string, string>,
  healthPreference?: number
): Food[] {
  if (!quizAnswers || Object.keys(quizAnswers).length === 0) {
    return [...mockFoods].sort((a, b) => b.healthScore - a.healthScore)
  }

  const answers = Object.values(quizAnswers).map((a) => a.toLowerCase())
  const preference = healthPreference || 50

  const scored = mockFoods.map((food) => {
    let score = 0

    // Match cravings - base score
    answers.forEach((answer) => {
      if (food.cravingMatch.some((match) => answer.includes(match) || match.includes(answer))) {
        score += 40
      }
    })

    // Apply health preference (0 = indulgent, 50 = balanced, 100 = healthy)
    const normalizedHealth = (preference - 50) / 50
    const healthInfluence = normalizedHealth * normalizedHealth * normalizedHealth * 50

    if (preference > 50) {
      score += (food.healthScore / 100) * healthInfluence
    } else if (preference < 50) {
      score += ((100 - food.healthScore) / 100) * Math.abs(healthInfluence)
    }

    return { food, score }
  })

  return scored.sort((a, b) => b.score - a.score).map((s) => s.food)
}

export function getCravingDescription(answers: Record<string, string>): string {
  const mood = answers.mood || ''
  const texture = answers.texture || ''
  const taste = answers.taste || ''

  return `You're craving something ${texture.toLowerCase()} & ${taste.toLowerCase()}`
}

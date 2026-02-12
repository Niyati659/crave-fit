export interface Food {
  id: string
  name: string
  image: string
  healthScore: number
  calories: number
  protein: number
  sugar: number
  category: string
  cravingMatch: string[]
  healthierAlternative?: string
  description: string
  healthierRecipe?: {
    name: string
    calories: number
    protein: number
    sugar: number
    ingredients: string[]
    instructions: string[]
    healthScore: number
  }
}

export const mockFoods: Food[] = [
  {
    id: '1',
    name: 'Crispy Fried Chicken',
    image: '/foods/crispy-chicken.jpg',
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
        'Boneless chicken thighs',
        'Cornstarch coating',
        'Paprika & garlic powder',
        'Olive oil spray',
      ],
      instructions: [
        'Pat chicken dry and season',
        'Coat lightly with cornstarch and spices',
        'Air fry at 400°F for 15 minutes',
        'Serve with lemon and fresh herbs',
      ],
      healthScore: 72,
    },
  },
  {
    id: '2',
    name: 'Grilled Chicken Salad',
    image: '/foods/grilled-chicken-salad.jpg',
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
    name: 'Chocolate Brownie',
    image: '/foods/chocolate-brownie.jpg',
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
        'Ripe avocado',
        'Dark chocolate (70% cacao)',
        'Almond flour',
        'Maple syrup',
        'Eggs',
        'Vanilla extract',
      ],
      instructions: [
        'Blend avocado with melted chocolate',
        'Mix in almond flour and maple syrup',
        'Fold in eggs and vanilla',
        'Bake at 350°F for 20 minutes',
      ],
      healthScore: 68,
    },
  },
  {
    id: '4',
    name: 'Greek Yogurt Parfait',
    image: '/foods/greek-yogurt-parfait.jpg',
    healthScore: 80,
    calories: 210,
    protein: 18,
    sugar: 18,
    category: 'Breakfast',
    cravingMatch: ['sweet', 'light', 'soft'],
    description:
      'Recommended because it balances your sweet tooth with protein and probiotics. A guilt-free indulgence.',
  },
  {
    id: '5',
    name: 'Crispy Veggie Spring Rolls',
    image: '/foods/spring-rolls.jpg',
    healthScore: 70,
    calories: 180,
    protein: 4,
    sugar: 3,
    category: 'Appetizer',
    cravingMatch: ['crispy', 'savory', 'light'],
    healthierAlternative: 'Air-Fried Spring Rolls',
    description:
      'Recommended because it satisfies your craving for crispy food with vegetables and fewer calories than fried options.',
  },
  {
    id: '6',
    name: 'Cheesy Pizza Slice',
    image: '/foods/pizza.jpg',
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
        'Whole wheat pizza dough',
        'Marinara sauce',
        'Part-skim mozzarella',
        'Bell peppers, mushrooms, spinach',
        'Fresh basil & olive oil',
      ],
      instructions: [
        'Spread marinara on whole wheat crust',
        'Layer veggies and cheese',
        'Bake at 425°F for 12-15 minutes',
        'Top with fresh basil',
      ],
      healthScore: 78,
    },
  },
  {
    id: '7',
    name: 'Smoothie Bowl',
    image: '/foods/smoothie-bowl.jpg',
    healthScore: 82,
    calories: 320,
    protein: 12,
    sugar: 32,
    category: 'Breakfast',
    cravingMatch: ['sweet', 'light', 'tired'],
    description:
      'Recommended because it energizes you with natural sweetness and superfoods. Perfect for a nutrient boost.',
  },
  {
    id: '8',
    name: 'Buffalo Cauliflower Bites',
    image: '/foods/buffalo-cauliflower.jpg',
    healthScore: 75,
    calories: 150,
    protein: 6,
    sugar: 2,
    category: 'Appetizer',
    cravingMatch: ['crispy', 'savory', 'energetic'],
    description:
      'Recommended because it offers a healthier take on wings with fewer calories and more vegetables.',
  },
]

export function getRecommendedFoods() {
  return mockFoods
}


export function getCravingDescription(answers: Record<string, string>): string {
  const mood = answers.mood || ''
  const texture = answers.texture || ''
  const taste = answers.taste || ''

  return `You're craving something ${texture.toLowerCase()} & ${taste.toLowerCase()}`
}

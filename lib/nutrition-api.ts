export async function fetchNutrition(query: string) {
  const API_KEY = process.env.NEXT_PUBLIC_CALORIE_NINJAS_KEY

  const res = await fetch(
    `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(
      query
    )}`,
    {
      headers: {
        "X-Api-Key": API_KEY!,
      },
    }
  )

  const data = await res.json()

  if (!data.items || data.items.length === 0) {
    throw new Error("No nutrition found")
  }

  const totals = data.items.reduce(
    (acc, item) => {
      acc.calories += item.calories || 0
      acc.protein += item.protein_g || 0
      acc.carbs += item.carbohydrates_total_g || 0
      acc.fat += item.fat_total_g || 0
      acc.fiber += item.fiber_g || 0
      return acc
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  )

  return totals
}

// src/lib/smartSuggestions.ts

type Recipe = {
  id: string
  title: string
  protein: number
  carbs: number
  fats: number
  fiber: number
  calories: number
}

type Remaining = {
  protein: number
  carbs: number
  fats: number
  fiber: number
  calories: number
}

export function getSmartSuggestions(
  recipes: Recipe[],
  macroType: string,
  remaining: Remaining
) {
  return recipes.filter(r => {
    if (macroType === "protein")
      return r.protein <= remaining.protein

    if (macroType === "carbs")
      return r.carbs <= remaining.carbs

    if (macroType === "fats")
      return r.fats <= remaining.fats

    if (macroType === "fiber")
      return r.fiber <= remaining.fiber

    if (macroType === "quick")
      return r.calories <= remaining.calories

    return true
  })
}

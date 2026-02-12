'use client'

let RECIPES_CACHE: any[] = []
let DETAILS_CACHE: any = {}
let INSTRUCTIONS_CACHE: any = {}
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ArrowLeft, Zap, Leaf } from 'lucide-react'

import {
  getRecipesInfo,
  getRecipeInstructions,
  getRecipeDetails,
} from '@/lib/api'

import { FoodDetailModal } from '@/components/recommendationfood-detail-modal'

interface RecommendationsScreenProps {
  quizMeta: any
  healthPreference: number
  onHealthPreferenceChange: (value: number) => void
  onBack: () => void
  onMealTrackerClick?: () => void
  onCookWithChef?: (recipe: { name: string, instructions: string[] }) => void
}

export function RecommendationsScreen({
  quizMeta,
  healthPreference,
  onHealthPreferenceChange,
  onBack,
  onMealTrackerClick,
  onCookWithChef,
}: RecommendationsScreenProps) {

  const [recipes, setRecipes] = useState<any[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  /* -------------------------------------------------- */
  /* ⭐ Slider → Calories Engine */
  /* -------------------------------------------------- */

  const getSliderCaloriesLimit = () => {

    const MIN_LIMIT = 250   // STRICT healthy 🥗🔥
    const MAX_LIMIT = 900

    const ratio = healthPreference / 100

    return Math.round(
      MAX_LIMIT - (ratio * (MAX_LIMIT - MIN_LIMIT))
    )
  }


  /* -------------------------------------------------- */
  /* ⭐ Filtering Logic */
  /* -------------------------------------------------- */
  const dietMatch = (recipe: any) => {

    if (!quizMeta.dietFilter) return true

    switch (quizMeta.dietFilter) {

      case 'vegan':
        return recipe.isVegan

      case 'vegetarian':
        return recipe.isVegetarian

      case 'high protein':
        return recipe.protein >= 25

      default:
        return true
    }
  }

  const applyQuizLogic = (recipe: any) => {

    const sliderLimit = getSliderCaloriesLimit()

    const withinCalories =
      recipe.calories >= quizMeta.calorieRange.min &&
      recipe.calories <= Math.min(
        quizMeta.calorieRange.max,
        sliderLimit    // ⭐ MAGIC INTERSECTION
      )

    const withinPrepTime =
      recipe.prepTime <= (quizMeta.maxPrepTime || 999)

    return withinCalories &&
      withinPrepTime &&
      dietMatch(recipe)

  }

  /* -------------------------------------------------- */
  /* ⭐ Ranking Engine */
  /* -------------------------------------------------- */
  const parseTasteProfile = (tasteText: string) => {

    if (!tasteText) return {}

    const text = tasteText.toLowerCase()

    return {
      sweet: text.includes('sweet'),
      spicy: text.includes('spicy'),
      salty: text.includes('salty'),
      bitter: text.includes('bitter'),
      umami: text.includes('umami'),
    }
  }

  const scoreRecipe = (recipe: any) => {

    const proteinTarget = quizMeta.proteinTarget || 25

    const proteinScore =
      1 - Math.abs(recipe.protein - proteinTarget) / proteinTarget

    const calorieMid =
      (quizMeta.calorieRange.min + quizMeta.calorieRange.max) / 2

    const calorieScore =
      1 - Math.abs(recipe.calories - calorieMid) / calorieMid

    return (
      proteinScore * 0.6 +
      calorieScore * 0.4
    )
  }

  /* -------------------------------------------------- */
  /* ⭐ Fetch Logic (Cached) */
  /* -------------------------------------------------- */
  const getRelaxedRecipes = (recipes: any[]) => {

    const sliderLimit = getSliderCaloriesLimit()

    /* ✅ STRICT FILTER */
    let strict = recipes.filter(recipe =>
      recipe.calories >= quizMeta.calorieRange.min &&
      recipe.calories <= Math.min(quizMeta.calorieRange.max, sliderLimit) &&
      recipe.prepTime <= (quizMeta.maxPrepTime || 999) &&
      dietMatch(recipe)
    )

    if (strict.length >= 10) return strict

    console.log("RELAXING CONSTRAINTS 😌")

    /* ✅ RELAXED FILTER */
    let relaxed = recipes.filter(recipe =>
      recipe.calories <= sliderLimit + 150 &&
      recipe.prepTime <= (quizMeta.maxPrepTime || 999) + 15 &&
      dietMatch(recipe)
    )

    return relaxed
  }

  const fetchRecipes = useCallback(async () => {

    if (!quizMeta?.calorieRange) return

    try {
      setLoading(true)

      const MIN_RECIPES = 10

      if (RECIPES_CACHE.length === 0) {

        console.log("LOADING CACHE...")

        let combined: any[] = []

        for (let page = 1; page <= 5; page++) {

          console.log("FETCH PAGE:", page)

          const data = await getRecipesInfo(page, 100)

          combined = [...combined, ...(data.recipes || [])]

          /* ⭐ POLITE API DELAY */
          await new Promise(r => setTimeout(r, 300))
        }

        RECIPES_CACHE = combined

        console.log("CACHE SIZE:", RECIPES_CACHE.length)
      }


      else {
        console.log("USING CACHE 😌")
      }

      const filtered = getRelaxedRecipes(RECIPES_CACHE)


      const ranked = filtered
        .map(recipe => ({
          ...recipe,
          score: scoreRecipe(recipe),
        }))
        .sort((a, b) => b.score - a.score)

      setRecipes(ranked.slice(0, MIN_RECIPES))

    } catch (err) {
      console.error("FETCH ERROR:", err)
    } finally {
      setLoading(false)
    }

  }, [quizMeta, healthPreference])

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  /* -------------------------------------------------- */
  /* ⭐ Click Handler */
  /* -------------------------------------------------- */

  const handleRecipeClick = async (recipe: any) => {

    console.log("CLICKED:", recipe)

    setLoading(true)

    let instructionsData
    let detailsData

    /* ✅ Instructions Cache */
    if (INSTRUCTIONS_CACHE[recipe.id]) {

      instructionsData = INSTRUCTIONS_CACHE[recipe.id]
    }
    else {

      instructionsData = await getRecipeInstructions(recipe.id)
      INSTRUCTIONS_CACHE[recipe.id] = instructionsData
    }

    /* ✅ Details Cache */
    if (DETAILS_CACHE[recipe.id]) {

      detailsData = DETAILS_CACHE[recipe.id]
    }
    else {

      detailsData = await getRecipeDetails(recipe.id)
      DETAILS_CACHE[recipe.id] = detailsData
    }

    const fullRecipe = {
      id: recipe.id,
      name: recipe.title,
      image: '/placeholder.svg',

      prepTime: recipe.prepTime,
      calories: recipe.calories,
      protein: recipe.protein,

      instructions: instructionsData.instructions,

      ingredients: detailsData.ingredients.map(
        (ing: any) => ing.ingredient
      ),
    }

    setSelectedRecipe(fullRecipe)

    setLoading(false)
  }



  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/3 flex flex-col">

      <header className="sticky top-0 z-20 bg-white/50 backdrop-blur-sm border-b py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">

          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <h1 className="flex-1 text-center text-2xl font-bold">
            Meals Matched to Your Craving
          </h1>

          {onMealTrackerClick && (
            <Button onClick={onMealTrackerClick} size="sm">
              Tracker
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-10">

          {quizMeta?.cravingProfile && (
            <div className="bg-primary/10 rounded-2xl p-6 text-center">
              <Zap className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {quizMeta.cravingProfile}
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 border space-y-4">
            <Leaf className="w-4 h-4 text-primary mx-auto" />

            <Slider
              value={[healthPreference]}
              onValueChange={(val) =>
                onHealthPreferenceChange(val[0])
              }
              min={0}
              max={100}
              step={1}
            />

            {/* ⭐ Premium Feedback */}
            <p className="text-sm text-muted-foreground text-center">
              {healthPreference >= 70
                ? "Healthy choices prioritized 🥗"
                : healthPreference <= 30
                  ? "Feeling indulgent today 😈"
                  : "Balanced nutrition ⚖️"}
            </p>
          </div>

          {loading ? (
            <div className="text-center">Finding meals...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {recipes.map((recipe, index) => (
                <div
                  key={`${recipe.id}-${index}`}
                  onClick={() => handleRecipeClick(recipe)}
                  className="rounded-2xl border p-4 hover:shadow-md cursor-pointer"
                >
                  <p className="font-bold">
                    {recipe.title}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {recipe.calories} kcal
                  </p>
                </div>
              ))}

            </div>
          )}

        </div>
      </div>

      <FoodDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  )
}
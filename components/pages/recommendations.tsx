'use client'

/* -------------------------------------------------- */
/* ⭐ GLOBAL CACHE */
/* -------------------------------------------------- */

let RECIPES_CACHE: any[] = []
let DETAILS_CACHE: any = {}
let INSTRUCTIONS_CACHE: any = {}

/* -------------------------------------------------- */
/* ⭐ IMPORTS */
/* -------------------------------------------------- */

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ArrowLeft, Zap, Leaf } from 'lucide-react'
import Image from 'next/image'

import {
  getRecipesInfo,
  getRecipeInstructions,
  getRecipeDetails,
} from '@/lib/api'

import { getDishImage } from '@/lib/dish-image-service'
import { FoodDetailModal } from '@/components/recommendationfood-detail-modal'

/* -------------------------------------------------- */
/* ⭐ PROPS */
/* -------------------------------------------------- */

interface RecommendationsScreenProps {
  quizMeta: any
  healthPreference: number
  onHealthPreferenceChange: (value: number) => void
  onBack: () => void
  onMealTrackerClick?: () => void
  onCookWithChef?: (recipe: { name: string; instructions: string[] }) => void
}

/* -------------------------------------------------- */
/* ⭐ COMPONENT */
/* -------------------------------------------------- */

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
  const [recipeImages, setRecipeImages] = useState<Record<string, string>>({})

  /* -------------------------------------------------- */
  /* ⭐ SLIDER → CALORIES ENGINE */
  /* -------------------------------------------------- */

  const getSliderCaloriesLimit = () => {
    const MIN_LIMIT = 250
    const MAX_LIMIT = 900
    const ratio = healthPreference / 100

    return Math.round(
      MAX_LIMIT - ratio * (MAX_LIMIT - MIN_LIMIT)
    )
  }

  /* -------------------------------------------------- */
  /* ⭐ FILTERING */
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

  const getRelaxedRecipes = (recipes: any[]) => {
    const sliderLimit = getSliderCaloriesLimit()

    let strict = recipes.filter(
      (recipe) =>
        recipe.calories >= quizMeta.calorieRange.min &&
        recipe.calories <=
          Math.min(quizMeta.calorieRange.max, sliderLimit) &&
        recipe.prepTime <= (quizMeta.maxPrepTime || 999) &&
        dietMatch(recipe)
    )

    if (strict.length >= 10) return strict

    /* RELAX */
    return recipes.filter(
      (recipe) =>
        recipe.calories <= sliderLimit + 150 &&
        recipe.prepTime <= (quizMeta.maxPrepTime || 999) + 15 &&
        dietMatch(recipe)
    )
  }

  /* -------------------------------------------------- */
  /* ⭐ RANKING */
  /* -------------------------------------------------- */

  const scoreRecipe = (recipe: any) => {
    const proteinTarget = quizMeta.proteinTarget || 25

    const proteinScore =
      1 -
      Math.abs(recipe.protein - proteinTarget) /
        proteinTarget

    const calorieMid =
      (quizMeta.calorieRange.min +
        quizMeta.calorieRange.max) /
      2

    const calorieScore =
      1 -
      Math.abs(recipe.calories - calorieMid) /
        calorieMid

    return proteinScore * 0.6 + calorieScore * 0.4
  }

  /* -------------------------------------------------- */
  /* ⭐ FETCH + CACHE */
  /* -------------------------------------------------- */

  const fetchRecipes = useCallback(async () => {
    if (!quizMeta?.calorieRange) return

    try {
      setLoading(true)

      /* CACHE LOAD */
      if (RECIPES_CACHE.length === 0) {
        let combined: any[] = []

        for (let page = 1; page <= 5; page++) {
          const data = await getRecipesInfo(page, 100)

          combined = [
            ...combined,
            ...(data.recipes || []),
          ]

          await new Promise((r) =>
            setTimeout(r, 300)
          )
        }

        RECIPES_CACHE = combined
      }

      /* FILTER + RANK */
      const filtered = getRelaxedRecipes(
        RECIPES_CACHE
      )

      const ranked = filtered
        .map((recipe) => ({
          ...recipe,
          score: scoreRecipe(recipe),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 12)

      setRecipes(ranked)

      /* IMAGE FETCH */
      const imgMap: Record<string, string> = {}

      await Promise.allSettled(
        ranked.map(async (r: any) => {
          try {
            const img = await getDishImage(
              r.title
            )
            if (img) imgMap[r.id] = img.url
          } catch {}
        })
      )

      setRecipeImages(imgMap)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [quizMeta, healthPreference])

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  /* -------------------------------------------------- */
  /* ⭐ CLICK → DETAILS */
  /* -------------------------------------------------- */

  const handleRecipeClick = async (recipe: any) => {
    setLoading(true)

    let instructionsData
    let detailsData

    if (INSTRUCTIONS_CACHE[recipe.id]) {
      instructionsData =
        INSTRUCTIONS_CACHE[recipe.id]
    } else {
      instructionsData =
        await getRecipeInstructions(recipe.id)
      INSTRUCTIONS_CACHE[recipe.id] =
        instructionsData
    }

    if (DETAILS_CACHE[recipe.id]) {
      detailsData = DETAILS_CACHE[recipe.id]
    } else {
      detailsData = await getRecipeDetails(
        recipe.id
      )
      DETAILS_CACHE[recipe.id] = detailsData
    }

    const fullRecipe = {
      id: recipe.id,
      name: recipe.title,
      image:
        recipeImages[recipe.id] ||
        '/placeholder.svg',
      prepTime: recipe.prepTime,
      calories: recipe.calories,
      protein: recipe.protein,
      instructions:
        instructionsData.instructions,
      ingredients:
        detailsData.ingredients.map(
          (ing: any) => ing.ingredient
        ),
    }

    setSelectedRecipe(fullRecipe)
    setLoading(false)
  }

  /* -------------------------------------------------- */
  /* ⭐ UI */
/* -------------------------------------------------- */

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-background/70 backdrop-blur border-b py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">

          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <h1 className="flex-1 text-center text-2xl font-bold">
            Meals Matched to Your Craving
          </h1>

          {onMealTrackerClick && (
            <Button size="sm">
              Tracker
            </Button>
          )}
        </div>
      </header>

      {/* BODY */}
      <div className="flex-1 px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* CRAVING */}
          {quizMeta?.cravingProfile && (
            <div className="bg-primary/10 rounded-2xl p-6 text-center">
              <Zap className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {quizMeta.cravingProfile}
              </p>
            </div>
          )}

          {/* SLIDER */}
          <div className="bg-card rounded-2xl p-6 border space-y-4">
            <Leaf className="w-4 h-4 text-primary mx-auto" />

            <Slider
              value={[healthPreference]}
              onValueChange={(val) =>
                onHealthPreferenceChange(
                  val[0]
                )
              }
              min={0}
              max={100}
              step={1}
            />

            <p className="text-sm text-muted-foreground text-center">
              {healthPreference >= 70
                ? 'Healthy choices prioritized 🥗'
                : healthPreference <= 30
                ? 'Feeling indulgent today 😈'
                : 'Balanced nutrition ⚖️'}
            </p>
          </div>

          {/* RECIPES */}
          {loading ? (
            <div className="text-center">
              Finding meals...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {recipes.map(
                (recipe, index) => (
                  <div
                    key={`${recipe.id}-${index}`}
                    onClick={() =>
                      handleRecipeClick(
                        recipe
                      )
                    }
                    className="rounded-2xl border bg-card overflow-hidden cursor-pointer hover:shadow-lg"
                  >
                    <div className="h-44 w-full relative">
                      <Image
                        src={
                          recipeImages[
                            recipe.id
                          ] ||
                          '/placeholder.svg'
                        }
                        alt={
                          recipe.title ||
                          'Food image'
                        }
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="p-4 space-y-1">
                      <p className="font-bold">
                        {recipe.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(
                          recipe.calories
                        )}{' '}
                        kcal
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      <FoodDetailModal
        recipe={selectedRecipe}
        onClose={() =>
          setSelectedRecipe(null)
        }
        onCookWithChef={onCookWithChef}
      />
    </div>
  )
}

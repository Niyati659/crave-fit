'use client'

let RECIPES_CACHE: any[] = []
let DETAILS_CACHE: any = {}
let INSTRUCTIONS_CACHE: any = {}

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ArrowLeft, Zap, Leaf } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { FoodDetailModal } from '@/components/recommendationfood-detail-modal'
import {
  getRecipesInfo,
  getRecipeInstructions,
  getRecipeDetails,
  searchRecipesByIngredientCategoriesTitle,
} from '@/lib/api'
import { getDishImage } from '@/lib/dish-image-service'

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
  const [recipeImages, setRecipeImages] = useState<Record<string, string>>({})

  /* -------------------------------------------------- */
  /* FETCH LOGIC (UNCHANGED) */
  /* -------------------------------------------------- */

  const fetchRecipes = useCallback(async () => {
    if (!quizMeta?.calorieRange) return
    try {
      setLoading(true)

      if (RECIPES_CACHE.length === 0) {
        let combined: any[] = []
        for (let page = 1; page <= 5; page++) {
          const data = await getRecipesInfo(page, 100)
          combined = [...combined, ...(data.recipes || [])]
          await new Promise(r => setTimeout(r, 3000))
        }
        RECIPES_CACHE = combined
      }

      const ranked = RECIPES_CACHE.slice(0, 12)
      setRecipes(ranked)

      const imgMap: Record<string, string> = {}
      await Promise.allSettled(
        ranked.map(async (r: any) => {
          try {
            const img = await getDishImage(r.title)
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
  }, [quizMeta])

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  /* -------------------------------------------------- */
  /* UI */
  /* -------------------------------------------------- */

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/70 backdrop-blur-md border-b border-border py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">

          <Button variant="ghost" size="icon" onClick={onBack}>
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

      <div className="flex-1 px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* Craving Profile */}
          {quizMeta?.cravingProfile && (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center shadow-sm">
              <Zap className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {quizMeta.cravingProfile}
              </p>
            </div>
          )}

          {/* Health Slider */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <Leaf className="w-4 h-4 text-primary mx-auto" />

            <Slider
              value={[healthPreference]}
              onValueChange={(val) => onHealthPreferenceChange(val[0])}
              min={0}
              max={100}
              step={1}
            />

            <p className="text-sm text-muted-foreground text-center">
              {healthPreference >= 70
                ? "Healthy choices prioritized 🥗"
                : healthPreference <= 30
                  ? "Feeling indulgent today 😈"
                  : "Balanced nutrition ⚖️"}
            </p>
          </div>

          {/* Recipes */}
          {loading ? (
            <div className="text-center text-muted-foreground">
              Finding meals...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {recipes.map((recipe, index) => (
                <div
                  key={`${recipe.id}-${index}`}
                  onClick={() => setSelectedRecipe(recipe)}
                  className="
                    rounded-2xl
                    border border-border
                    bg-card
                    overflow-hidden
                    cursor-pointer
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:shadow-xl
                    hover:border-primary/40
                  "
                >
                  {/* Image */}
                  <div className="h-44 w-full relative bg-muted overflow-hidden">
                    <Image
                      src={recipeImages[recipe.id] || '/placeholder.svg'}
                      alt={recipe.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2">
                    <p className="font-bold text-foreground line-clamp-2">
                      {recipe.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span>{Math.round(recipe.calories)} kcal</span>

                      {recipe.protein > 0 && (
                        <span className="text-blue-400 font-medium">
                          {Math.round(recipe.protein)}g protein
                        </span>
                      )}

                      {recipe.carbs > 0 && (
                        <span className="text-amber-400 font-medium">
                          {Math.round(recipe.carbs)}g carbs
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            </div>
          )}

        </div>
      </div>

      <FoodDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onCookWithChef={onCookWithChef}
      />
    </div>
  )
}

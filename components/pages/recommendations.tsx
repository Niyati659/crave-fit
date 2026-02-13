'use client'

let RECIPES_CACHE: any[] = []
let DETAILS_CACHE: any = {}
let INSTRUCTIONS_CACHE: any = {}
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ArrowLeft, Zap, Leaf } from 'lucide-react'
import Image from 'next/image'

import {
  getRecipesInfo,
  getRecipeInstructions,
  getRecipeDetails,
  searchRecipesByIngredientCategoriesTitle,

} from '@/lib/api'

import { getDishImage } from '@/lib/dish-image-service'
import { supabase } from '@/lib/supabase'
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
  const [recipeImages, setRecipeImages] = useState<Record<string, string>>({})

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

    /* ✅ STRICT FILTER (calories=0 means unknown, let them through) */
    let strict = recipes.filter(recipe =>
      (recipe.calories === 0 || (
        recipe.calories >= quizMeta.calorieRange.min &&
        recipe.calories <= Math.min(quizMeta.calorieRange.max, sliderLimit)
      )) &&
      recipe.prepTime <= (quizMeta.maxPrepTime || 999) &&
      dietMatch(recipe)
    )

    if (strict.length >= 10) return strict

    console.log("RELAXING CONSTRAINTS 😌")

    /* ✅ RELAXED FILTER */
    let relaxed = recipes.filter(recipe =>
      (recipe.calories === 0 || recipe.calories <= sliderLimit + 150) &&
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

          /* ⭐ POLITE API DELAY — 25 req/min limit = ~2.5s per call */
          await new Promise(r => setTimeout(r, 3000))
        }

        RECIPES_CACHE = combined

        console.log("CACHE SIZE:", RECIPES_CACHE.length)
      }


      else {
        console.log("USING CACHE 😌")
      }

      /* -------------------------------------------------- */
      /* 🍬🧂 SWEET / SAVORY TARGETED API                  */
      /* -------------------------------------------------- */

      const SWEET_INGREDIENTS = ['cinnamon', 'purpose flour', 'milk', 'vanilla']
      const SAVORY_INGREDIENTS = ['onion', 'soy sauce', 'garlic', 'garlic clove']
      const SWEET_CATEGORIES = ['Bakery', 'Additive-Yeast', 'Beverage', 'Beverage Caffeinated', 'Berry', 'Additive-Sugar']

      const hasTasteBias = quizMeta?.sweetBias || quizMeta?.savoryBias
      let targetedRecipes: any[] = []

      if (quizMeta?.sweetBias) {
        console.log('🍬 SWEET BIAS — fetching targeted recipes')
        const sweetData = await searchRecipesByIngredientCategoriesTitle({
          includeIngredients: SWEET_INGREDIENTS,
          excludeIngredients: SAVORY_INGREDIENTS,
          includeCategories: SWEET_CATEGORIES,
          excludeCategories: [],
          page: 1,
          limit: 10,
        })
        targetedRecipes = [...(sweetData.recipes || [])]
      } else if (quizMeta?.savoryBias) {
        console.log('🧂 SAVORY BIAS — fetching targeted recipes')
        const savoryData = await searchRecipesByIngredientCategoriesTitle({
          includeIngredients: SAVORY_INGREDIENTS,
          excludeIngredients: SWEET_INGREDIENTS,
          excludeCategories: SWEET_CATEGORIES,
          includeCategories: [],
          page: 1,
          limit: 10,
        })
        targetedRecipes = [...(savoryData.recipes || [])]
      }

      console.log('TARGETED RECIPES COUNT:', targetedRecipes.length)

      /* ⭐ Cross-reference targeted recipes with master list
         to fill in protein/carbs/fat that the ingredient API doesn't return */
      if (targetedRecipes.length > 0 && RECIPES_CACHE.length > 0) {
        const cacheMap = new Map(RECIPES_CACHE.map((r: any) => [r.id, r]))
        targetedRecipes = targetedRecipes.map((recipe: any) => {
          const cached = cacheMap.get(recipe.id)
          if (cached) {
            return {
              ...recipe,
              protein: cached.protein || recipe.protein,
              carbs: cached.carbs || recipe.carbs,
              fat: cached.fat || recipe.fat,
              energy: cached.energy || recipe.energy,
              prepTime: cached.prepTime || recipe.prepTime,
              cookTime: cached.cookTime || recipe.cookTime,
              utensils: cached.utensils || recipe.utensils,
              processes: cached.processes || recipe.processes,
            }
          }
          return recipe
        })
        console.log('✅ Cross-referenced', targetedRecipes.filter((r: any) => r.protein > 0).length, 'recipes with master list nutrition')
      }

      /* ⭐ If we have targeted results, use ONLY those.
         General pool has no ingredient data so random
         savory/sweet recipes leak through otherwise. */
      let recipePool = (hasTasteBias && targetedRecipes.length >= 5)
        ? targetedRecipes
        : [...targetedRecipes, ...RECIPES_CACHE]

      /* 🔬 Enrichment no longer needed — nutrition now extracted from master list */
      // if (targetedRecipes.length > 0) {
      //   recipePool = await enrichRecipesWithDetails(recipePool, 10)
      // }

      const filtered = getRelaxedRecipes(recipePool)


      const ranked = filtered
        .map(recipe => ({
          ...recipe,
          score: scoreRecipe(recipe),
        }))
        .sort((a, b) => b.score - a.score)

      const topRecipes = ranked.slice(0, MIN_RECIPES)
      setRecipes(topRecipes)

      // 🖼 Resolve images in parallel (fire-and-forget so cards render fast)
      const resolveImages = async () => {
        const imgMap: Record<string, string> = {}
        await Promise.allSettled(
          topRecipes.map(async (r: any) => {
            try {
              const img = await getDishImage(r.title)
              if (img) imgMap[r.id] = img.url
            } catch { /* skip */ }
          })
        )
        setRecipeImages(prev => ({ ...prev, ...imgMap }))
      }
      resolveImages()

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

    let instructionsData: any = { instructions: [] }
    let detailsData: any = { ingredients: [] }

    /* -------------------------------------------------- */
    /* 🗄️ STEP 1: Check Supabase cache first              */
    /* -------------------------------------------------- */
    try {
      const { data: cached } = await supabase
        .from('recipes')
        .select('instructions, ingredients, protein, carbs, fat, calories')
        .eq('recipe_id', recipe.id)
        .limit(1)
        .single()

      if (cached && cached.instructions && cached.instructions.length > 0) {
        console.log('✅ SUPABASE HIT — using cached data for', recipe.title)
        instructionsData = { instructions: cached.instructions }
        detailsData = { ingredients: cached.ingredients || [] }

        // Also fill in nutrition from Supabase if master list was missing
        if (cached.protein && cached.protein > 0 && recipe.protein === 0) recipe.protein = cached.protein
        if (cached.carbs && cached.carbs > 0 && recipe.carbs === 0) recipe.carbs = cached.carbs
        if (cached.fat && cached.fat > 0 && recipe.fat === 0) recipe.fat = cached.fat
      } else {
        throw new Error('Cache miss')  // fall through to API
      }
    } catch {
      /* -------------------------------------------------- */
      /* 🌐 STEP 2: Fallback to Foodoscope API              */
      /* -------------------------------------------------- */
      console.log('📡 SUPABASE MISS — calling APIs for', recipe.title)

      /* ✅ Instructions — in-memory cache → API */
      if (INSTRUCTIONS_CACHE[recipe.id]) {
        instructionsData = INSTRUCTIONS_CACHE[recipe.id]
      } else {
        try {
          instructionsData = await getRecipeInstructions(recipe.id)
          INSTRUCTIONS_CACHE[recipe.id] = instructionsData
        } catch { console.error('Instructions API failed for', recipe.id) }
      }

      /* ✅ Details — in-memory cache → API */
      if (DETAILS_CACHE[recipe.id]) {
        detailsData = DETAILS_CACHE[recipe.id]
      } else {
        try {
          detailsData = await getRecipeDetails(recipe.id)
          DETAILS_CACHE[recipe.id] = detailsData
        } catch { console.error('Details API failed for', recipe.id) }
      }

      /* -------------------------------------------------- */
      /* 💾 STEP 3: Save to Supabase for next time          */
      /* -------------------------------------------------- */
      const mappedIngredients = (detailsData.ingredients || []).map((ing: any) => ({
        name: ing.ingredient || '',
        quantity: ing.quantity || '0',
        unit: ing.unit || '',
        phrase: ing.ingredient_Phrase || ing.ingredient || '',
      }))

      try {
        await supabase
          .from('recipes')
          .upsert([{
            recipe_id: recipe.id,
            name: recipe.title,
            calories: recipe.calories || 0,
            protein: recipe.protein || 0,
            carbs: recipe.carbs || 0,
            fat: recipe.fat || 0,
            cook_time: recipe.cookTime || 0,
            prep_time: recipe.prepTime || 0,
            servings: recipe.servings || 0,
            region: recipe.region || '',
            continent: recipe.continent || '',
            instructions: instructionsData.instructions || [],
            ingredients: mappedIngredients,
          }], { onConflict: 'recipe_id' })

        console.log('💾 Cached to Supabase:', recipe.title)
      } catch (err) {
        console.error('Supabase cache write failed:', err)
      }
    }

    // Resolve image for the detail modal
    let recipeImageUrl = recipeImages[recipe.id] || '/placeholder.svg'
    if (recipeImageUrl === '/placeholder.svg') {
      try {
        const img = await getDishImage(recipe.title)
        if (img) recipeImageUrl = img.url
      } catch { /* fallback to placeholder */ }
    }

    const fullRecipe = {
      id: recipe.id,
      name: recipe.title,
      image: recipeImageUrl,

      // ⭐ Full nutrition from master list
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      totalTime: recipe.totalTime,
      servings: recipe.servings,
      calories: recipe.calories,
      energy: recipe.energy,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,

      // ⭐ Metadata
      region: recipe.region,
      subRegion: recipe.subRegion,
      utensils: recipe.utensils,
      processes: recipe.processes,

      // ⭐ Health score: lower cal + higher protein = healthier
      healthScore: Math.round(
        Math.min(100, Math.max(0,
          Math.max(0, 100 - (recipe.calories / 8)) +
          Math.min(recipe.protein * 2, 40)
        ))
      ),

      // ⭐ Instructions & ingredients (from Supabase or API)
      instructions: instructionsData.instructions || [],
      ingredients: (detailsData.ingredients || []).map(
        (ing: any) => typeof ing === 'string' ? ing : (ing.phrase || ing.name || ing.ingredient || ing)
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
                  className="rounded-2xl border overflow-hidden hover:shadow-lg cursor-pointer transition-shadow duration-300 bg-white"
                >
                  {/* Recipe Image */}
                  <div className="h-44 w-full relative bg-muted overflow-hidden">
                    <Image
                      src={recipeImages[recipe.id] || '/placeholder.svg'}
                      alt={recipe.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-4">
                    <p className="font-bold line-clamp-2">
                      {recipe.title}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span>{Math.round(recipe.calories)} kcal</span>
                      {recipe.protein > 0 && (
                        <span className="text-blue-600 font-medium">{Math.round(recipe.protein)}g protein</span>
                      )}
                      {recipe.carbs > 0 && (
                        <span className="text-amber-600 font-medium">{Math.round(recipe.carbs)}g carbs</span>
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
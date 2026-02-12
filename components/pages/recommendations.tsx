// 'use client'

// import { useState, useEffect, useCallback } from 'react'
// import { Button } from '@/components/ui/button'
// import { Slider } from '@/components/ui/slider'
// import { ArrowLeft, Zap, Leaf } from 'lucide-react'

// import {
//   getRecipesByCalories,
//   getRecipeMasterInfo,
//   getNutritionMasterInfo,
//   getRecipeInstructions,
// } from '@/lib/api'

// import { FoodDetailModal } from '@/components/food-detail-modal'

// interface RecommendationsScreenProps {
//   quizMeta: any
//   healthPreference: number
//   onHealthPreferenceChange: (value: number) => void
//   onBack: () => void
//   onMealTrackerClick?: () => void
// }

// export function RecommendationsScreen({
//   quizMeta,
//   healthPreference,
//   onHealthPreferenceChange,
//   onBack,
//   onMealTrackerClick,
// }: RecommendationsScreenProps) {
//   const [recipes, setRecipes] = useState<any[]>([])
//   const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [masterInfo, setMasterInfo] = useState<any[]>([])
//   const [masterNutrition, setMasterNutrition] = useState<any[]>([])

//   /* ✅ NORMALIZER */
//   const normalizeRecipe = (recipe: any, index: number) => ({
//     id:
//       recipe.Recipe_id ||
//       recipe.RecipeId ||
//       recipe.recipeId ||
//       recipe._id ||
//       `fallback-${index}`,

//     name:
//       recipe.Recipe_title ||
//       recipe.RecipeName ||
//       recipe.name ||
//       'Unnamed Meal',

//     image: recipe.ImageURL || recipe.image || '/placeholder.jpg',

//     calories:
//       Number(recipe['Energy (kcal)']) ||
//       Number(recipe.Calories) ||
//       0,
//   })

//   /* ✅ LOAD MASTER DATA ONCE */
//   useEffect(() => {
//     const loadMasterData = async () => {
//       try {
//         const infoData = await getRecipeMasterInfo()
//         const nutritionData = await getNutritionMasterInfo()

//         console.log('MASTER INFO:', infoData)
//         console.log('MASTER NUTRITION:', nutritionData)

//         setMasterInfo(infoData || [])
//         setMasterNutrition(nutritionData || [])
//       } catch (err) {
//         console.error('MASTER DATA ERROR:', err)
//       }
//     }

//     loadMasterData()
//   }, [])

//   /* ✅ FETCH RECIPES (STABLE FUNCTION) */
//   const fetchRecipes = useCallback(async () => {
//     if (!quizMeta?.calorieRange) return

//     try {
//       setLoading(true)

//       const data = await getRecipesByCalories(
//         quizMeta.calorieRange.min,
//         quizMeta.calorieRange.max
//       )

//       console.log('CALORIES API:', data)

//       setRecipes(
//         data?.payload?.data ||
//         data?.data ||
//         []
//       )
//     } catch (err) {
//       console.error('RECIPES ERROR:', err)
//     } finally {
//       setLoading(false)
//     }
//   }, [quizMeta?.calorieRange?.min, quizMeta?.calorieRange?.max])

//   /* ✅ DEPENDENCY FIX */
//   useEffect(() => {
//     fetchRecipes()
//   }, [fetchRecipes])

//   /* ✅ FULL HYDRATION */
//   const handleRecipeClick = async (recipeId: string) => {
//     try {
//       setLoading(true)

//       const info = masterInfo.find(
//         r => String(r.Recipe_id) === String(recipeId)
//       )

//       const nutrition = masterNutrition.find(
//         n => String(n.Recipe_id) === String(recipeId)
//       )

//       const instructionsData = await getRecipeInstructions(recipeId)

//       const fullRecipe = {
//         id: recipeId,
//         name: info?.Recipe_title || 'Unnamed Meal',
//         image: info?.ImageURL || '/placeholder.jpg',
//         cuisine: info?.Region,
//         prepTime: info?.prep_time || 0,

//         calories: Number(nutrition?.['Energy (kcal)']) || 0,
//         protein: Number(nutrition?.['Protein (g)']) || 0,
//         carbs: Number(nutrition?.['Carbohydrate, by difference (g)']) || 0,
//         fat: Number(nutrition?.['Total lipid (fat) (g)']) || 0,

//         ingredients: [],
//         instructions: instructionsData?.steps || [],
//       }

//       console.log('FULL HYDRATED:', fullRecipe)

//       setSelectedRecipe(fullRecipe)
//     } catch (err) {
//       console.error('HYDRATION ERROR:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/3 flex flex-col">

//       {/* Header */}
//       <header className="sticky top-0 z-20 bg-white/50 backdrop-blur-sm border-b border-border/30 py-4 px-4">
//         <div className="max-w-6xl mx-auto flex items-center justify-between">
//           <Button variant="ghost" size="icon" onClick={onBack}>
//             <ArrowLeft className="w-5 h-5" />
//           </Button>

//           <h1 className="flex-1 text-center text-2xl font-bold">
//             Meals Matched to Your Craving
//           </h1>

//           {onMealTrackerClick && (
//             <Button onClick={onMealTrackerClick} size="sm">
//               Tracker
//             </Button>
//           )}
//         </div>
//       </header>

//       {/* Content */}
//       <div className="flex-1 px-4 py-10">
//         <div className="max-w-6xl mx-auto space-y-10">

//           {/* Craving */}
//           {quizMeta?.cravingProfile && (
//             <div className="bg-primary/10 rounded-2xl p-6 text-center">
//               <div className="flex items-center justify-center gap-2 mb-2">
//                 <Zap className="w-5 h-5 text-primary" />
//                 <p className="text-xs font-bold text-primary uppercase">
//                   Your Craving
//                 </p>
//               </div>
//               <p className="text-2xl font-bold">
//                 {quizMeta.cravingProfile}
//               </p>
//             </div>
//           )}

//           {/* Reasons */}
//           {quizMeta?.reasons && (
//             <div className="bg-secondary/10 rounded-2xl p-6">
//               <p className="text-sm font-bold mb-2">
//                 Why these meals?
//               </p>
//               <ul className="text-sm text-muted-foreground space-y-1">
//                 {quizMeta.reasons.map((reason: string) => (
//                   <li key={reason}>✔ {reason}</li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {/* Slider */}
//           <div className="bg-white rounded-2xl p-6 border space-y-4">
//             <div className="flex items-center gap-2">
//               <Leaf className="w-4 h-4 text-primary" />
//               <p className="text-sm font-bold">
//                 Adjust Health Preference
//               </p>
//             </div>

//             <Slider
//               value={[healthPreference]}
//               onValueChange={(val) =>
//                 onHealthPreferenceChange(val[0])
//               }
//               min={0}
//               max={100}
//               step={1}
//             />
//           </div>

//           {/* Header */}
//           <div className="flex items-center justify-between">
//             <h2 className="text-xl font-bold">
//               Recommended Meals
//             </h2>

//             <span className="text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-full">
//               {recipes.length} Options
//             </span>
//           </div>

//           {/* Grid */}
//           {loading ? (
//             <div className="text-center text-muted-foreground">
//               Finding meals aligned with your craving...
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {recipes.map((rawRecipe, index) => {
//                 const recipe = normalizeRecipe(rawRecipe, index)

//                 return (
//                   <div
//                     key={`${recipe.id}-${index}`}
//                     onClick={() => handleRecipeClick(recipe.id)}
//                     className="rounded-2xl border p-4 hover:shadow-md cursor-pointer transition-all hover:scale-[1.02]"
//                   >
//                     <img
//                       src={recipe.image}
//                       className="rounded-xl mb-3"
//                     />

//                     <p className="font-bold">
//                       {recipe.name}
//                     </p>

//                     <p className="text-sm text-muted-foreground">
//                       {recipe.calories} kcal
//                     </p>
//                   </div>
//                 )
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Modal */}
//       <FoodDetailModal
//         recipe={selectedRecipe}
//         onClose={() => setSelectedRecipe(null)}
//       />
//     </div>
//   )
// }
'use client'

let RECIPES_CACHE:any[] = []

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ArrowLeft, Zap, Leaf } from 'lucide-react'

import {
  getRecipesInfo,
  getRecipeInstructions,
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
  const dietMatch = (recipe:any) => {

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

  const applyQuizLogic = (recipe:any) => {

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

  const scoreRecipe = (recipe:any) => {

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
  const getRelaxedRecipes = (recipes:any[]) => {

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

  let combined:any[] = []

  for (let page = 1; page <= 20; page++) {

    console.log("FETCH PAGE:", page)

    const data = await getRecipesInfo(page, 100)

    combined = [...combined, ...(data.recipes || [])]
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
        .sort((a,b) => b.score - a.score)

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

  const handleRecipeClick = async (recipe:any) => {

    console.log("CLICKED:", recipe)

    setLoading(true)

    const instructionsData = await getRecipeInstructions(recipe.id)

    const fullRecipe = {
      id: recipe.id,
      name: recipe.title,
      image: '/placeholder.svg',

      prepTime: recipe.prepTime,
      calories: recipe.calories,
      protein: recipe.protein,

      instructions: instructionsData.instructions,
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








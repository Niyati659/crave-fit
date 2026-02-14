const BASE_URL = `${process.env.BASE_URL}/recipe2-api`
const API_KEY = process.env.NEXT_PUBLIC_FOODOSCOPE_KEY

/* -------------------------------------------------- */
/* 🍽 MASTER RECIPES INFO */
/* -------------------------------------------------- */

export async function getRecipesInfo(page = 1, limit = 300) {
  try {
    console.log('RECIPES INFO REQUEST:', page)

    const res = await fetch(
      `${BASE_URL}/recipe/recipesinfo?page=${page}&limit=${limit}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    )

    if (!res.ok) {
      console.error("API STATUS:", res.status)
      const text = await res.text()
      console.error("API ERROR BODY:", text)

      throw new Error(`RecipesInfo API failed: ${res.status}`)
    }


    const data = await res.json()

    console.log('RECIPES INFO RAW:', data)

    /* ✅ NORMALIZATION */
    const normalizedRecipes = (data?.payload?.data || []).map((r: any) => ({
      id: r.Recipe_id,
      title: r.Recipe_title,

      // ⭐ Timing
      prepTime: Number(r.prep_time) || 0,
      cookTime: Number(r.cook_time) || 0,
      totalTime: Number(r.total_time) || 0,
      servings: Number(r.servings) || 1,

      // ⭐ Full Nutrition (from master list — no extra API call needed)
      calories: Number(r.Calories) || 0,
      energy: Number(r['Energy (kcal)']) || 0,
      protein: Number(r['Protein (g)']) || 0,
      carbs: Number(r['Carbohydrate, by difference (g)']) || 0,
      fat: Number(r['Total lipid (fat) (g)']) || 0,

      // ⭐ Geography
      region: r.Region || '',
      subRegion: r.Sub_region || '',
      continent: r.Continent || '',

      // ⭐ Cooking Metadata
      utensils: r.Utensils || '',
      processes: r.Processes || '',
      source: r.Source || '',

      // ⭐ Diet flags
      isVegan: Number(r.vegan) === 1,
      isPescetarian: Number(r.pescetarian) === 1,
      isVegetarian:
        Number(r.ovo_vegetarian) === 1 ||
        Number(r.lacto_vegetarian) === 1 ||
        Number(r.ovo_lacto_vegetarian) === 1,
    }))


    return {
      recipes: normalizedRecipes,
      pagination: data?.payload?.pagination || null,
    }

  } catch (error) {
    console.error('RecipesInfo ERROR:', error)

    return {
      recipes: [],
      pagination: null,
    }
  }
}

/* -------------------------------------------------- */
/* 📜 INSTRUCTIONS */
/* -------------------------------------------------- */

export async function getRecipeInstructions(recipeId: string) {
  try {
    console.log('INSTRUCTIONS REQUEST:', recipeId)

    const res = await fetch(
      `${BASE_URL}/instructions/${recipeId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    )

    if (!res.ok) throw new Error('Instructions API failed')

    const data = await res.json()

    console.log('INSTRUCTIONS RAW:', data)

    return {
      instructions: data?.steps || [],
    }

  } catch (error) {
    console.error('Instructions ERROR:', error)

    return { instructions: [] }
  }
}
/* -------------------------------------------------- */
/* 🍅 RECIPE DETAILS (INGREDIENTS) */
/* -------------------------------------------------- */

export async function getRecipeDetails(recipeId: string) {
  try {
    console.log("DETAILS REQUEST:", recipeId)

    const res = await fetch(
      `${BASE_URL}/search-recipe/${recipeId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    )

    if (!res.ok) throw new Error('Recipe Details API failed')

    const data = await res.json()

    console.log("DETAILS RAW:", data)

    return {
      recipe: data?.recipe || null,
      ingredients: data?.ingredients || [],
    }

  } catch (error) {
    console.error("Details ERROR:", error)

    return {
      recipe: null,
      ingredients: [],
    }
  }
}
// /* -------------------------------------------------- */
// /* 🌶 FLAVORDB → TASTE THRESHOLD */
// /* -------------------------------------------------- */

// export async function getTasteThreshold(value: string) {
//   try {
//     console.log("FLAVORDB REQUEST:", value)

//     const res = await fetch(
//       `https://api.foodoscope.com/flavordb/properties/taste-threshold?values=${value}`,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${API_KEY}`,
//         },
//       }
//     )

//     if (!res.ok) throw new Error('FlavorDB API failed')

//     const data = await res.json()

//     console.log("FLAVORDB RAW:", data)

//     return data?.content?.[0] || null

//   } catch (error) {
//     console.error("FlavorDB ERROR:", error)
//     return null
//   }
// }

/* -------------------------------------------------- */
/* 🍬🧂 SEARCH BY INGREDIENTS + CATEGORIES + TITLE  */
/* -------------------------------------------------- */

interface IngredientCategorySearchParams {
  includeIngredients?: string[]
  excludeIngredients?: string[]
  includeCategories?: string[]
  excludeCategories?: string[]
  title?: string
  page?: number
  limit?: number
}

export async function searchRecipesByIngredientCategoriesTitle(
  params: IngredientCategorySearchParams
) {
  try {
    const {
      includeIngredients = [],
      excludeIngredients = [],
      includeCategories = [],
      excludeCategories = [],
      title = '',
      page = 1,
      limit = 10,
    } = params

    const queryParams = new URLSearchParams()
    if (includeIngredients.length)
      queryParams.set('includeIngredients', includeIngredients.join(', '))
    if (excludeIngredients.length)
      queryParams.set('excludeIngredients', excludeIngredients.join(', '))
    if (includeCategories.length)
      queryParams.set('includeCategories', includeCategories.join(', '))
    if (excludeCategories.length)
      queryParams.set('excludeCategories', excludeCategories.join(', '))
    if (title) queryParams.set('title', title)
    queryParams.set('page', String(page))
    queryParams.set('limit', String(limit))

    const url = `${BASE_URL}/recipebyingredient/by-ingredients-categories-title?${queryParams.toString()}`

    console.log('SWEET/SAVORY API REQUEST:', url)

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    if (!res.ok) {
      console.error('Sweet/Savory API STATUS:', res.status)
      const text = await res.text()
      console.error('Sweet/Savory API ERROR:', text)
      throw new Error(`Sweet/Savory API failed: ${res.status}`)
    }

    const data = await res.json()

    console.log('SWEET/SAVORY API RAW:', data)

    /* ⚠️ This API returns FEWER fields than the master list —
       NO Protein, Carbs, Fat, Energy, Utensils, Processes, Source */
    const normalizedRecipes = (data?.payload?.data || []).map((r: any) => ({
      id: r.Recipe_id,
      title: r.Recipe_title,

      // ⭐ Timing
      prepTime: Number(r.prep_time) || 0,
      cookTime: Number(r.cook_time) || 0,
      totalTime: Number(r.total_time) || 0,
      servings: r.servings || '1',

      // ⭐ Nutrition (only Calories available from this endpoint)
      calories: Number(r.Calories) || 0,
      energy: 0,
      protein: 0,   // NOT returned by this API
      carbs: 0,      // NOT returned by this API
      fat: 0,        // NOT returned by this API

      // ⭐ Geography
      region: r.Region || '',
      subRegion: r.Sub_region || '',
      continent: r.Continent || '',

      // ⭐ Not available from this endpoint
      utensils: '',
      processes: '',
      source: '',

      // ⭐ Diet flags
      isVegan: Number(r.vegan) === 1,
      isPescetarian: Number(r.pescetarian) === 1,
      isVegetarian:
        Number(r.ovo_vegetarian) === 1 ||
        Number(r.lacto_vegetarian) === 1 ||
        Number(r.ovo_lacto_vegetarian) === 1,
    }))

    return {
      recipes: normalizedRecipes,
      pagination: data?.payload?.pagination || null,
    }
  } catch (error) {
    console.error('Sweet/Savory API ERROR:', error)
    return {
      recipes: [],
      pagination: null,
    }
  }
}

/* -------------------------------------------------- */
/* 🔬 ENRICH RECIPES WITH MACROS (protein, carbs, fat) */
/* -------------------------------------------------- */

export async function enrichRecipesWithDetails(recipes: any[], maxEnrich = 10) {
  const toEnrich = recipes.filter(r => r.protein === 0).slice(0, maxEnrich)

  if (toEnrich.length === 0) return recipes

  console.log(`🔬 ENRICHING ${toEnrich.length} recipes with macro data...`)

  const enrichedMap: Record<string, any> = {}

  for (const recipe of toEnrich) {
    try {
      const details = await getRecipeDetails(recipe.id)
      if (details.recipe) {
        enrichedMap[recipe.id] = {
          protein: Number(details.recipe['Protein (g)']) || 0,
          carbs: Number(details.recipe['Carbohydrate, by difference (g)']) || 0,
          fat: Number(details.recipe['Total lipid (fat) (g)']) || 0,
          calories: Number(details.recipe['Energy (kcal)']) || recipe.calories,
        }
      }
      await new Promise(r => setTimeout(r, 200))
    } catch (err) {
      console.error(`Enrich failed for ${recipe.id}:`, err)
    }
  }

  return recipes.map(recipe => {
    const macros = enrichedMap[recipe.id]
    if (macros) {
      return { ...recipe, ...macros }
    }
    return recipe
  })
}
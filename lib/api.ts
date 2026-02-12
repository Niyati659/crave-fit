const BASE_URL = 'https://api.foodoscope.com/recipe2-api'
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
  prepTime: Number(r.prep_time) || 0,
  calories: Number(r.Calories) || 0,
  protein: Number(r['Protein (g)']) || 0,

  region: r.Region || '',

  isVegan: Number(r.vegan) === 1,
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
      `https://api.foodoscope.com/recipe2-api/search-recipe/${recipeId}`,
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
/* -------------------------------------------------- */
/* 🌶 FLAVORDB → TASTE THRESHOLD */
/* -------------------------------------------------- */

export async function getTasteThreshold(value: string) {
  try {
    console.log("FLAVORDB REQUEST:", value)

    const res = await fetch(
      `https://api.foodoscope.com/flavordb/properties/taste-threshold?values=${value}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    )

    if (!res.ok) throw new Error('FlavorDB API failed')

    const data = await res.json()

    console.log("FLAVORDB RAW:", data)

    return data?.content?.[0] || null

  } catch (error) {
    console.error("FlavorDB ERROR:", error)
    return null
  }
}
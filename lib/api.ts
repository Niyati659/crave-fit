// const CALORIES_BASE_URL =
//   'https://api.foodoscope.com/recipe2-api/recipes-calories'

// const DIET_BASE_URL =
//   'https://api.foodoscope.com/recipe2-api/recipe-diet'

// const BASE_URL =
//   'https://api.foodoscope.com/recipe2-api'

// const API_KEY = process.env.NEXT_PUBLIC_FOODOSCOPE_KEY

// /* -------------------------------------------------- */
// /* 🍽 GET RECIPES BY CALORIES */
// /* -------------------------------------------------- */

// export async function getRecipesByCalories(
//   minCalories: number,
//   maxCalories: number,
//   limit = 30
// ) {
//   try {
//     console.log('CALORIES REQUEST:', minCalories, maxCalories)

//     const res = await fetch(
//       `${CALORIES_BASE_URL}/calories?minCalories=${minCalories}&maxCalories=${maxCalories}&limit=${limit}`,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${API_KEY}`,
//         },
//       }
//     )

//     if (!res.ok) throw new Error('Calories API failed')

//     const data = await res.json()

//     console.log('CALORIES RAW:', data)

//     return {
//       recipes: data?.data || [],
//     }

//   } catch (error) {
//     console.error('Calories ERROR:', error)
//     return { recipes: [] }
//   }
// }

// /* -------------------------------------------------- */
// /* 🥗 SINGLE RECIPE NUTRITION */
// /* -------------------------------------------------- */

// export async function getRecipeNutrition(recipeId: string) {
//   try {
//     console.log('NUTRITION REQUEST:', recipeId)

//     const res = await fetch(
//       `${BASE_URL}/recipe-nutri/nutritioninfo/${recipeId}`,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${API_KEY}`,
//         },
//       }
//     )

//     if (!res.ok) throw new Error('Nutrition API failed')

//     const data = await res.json()

//     console.log('NUTRITION RAW:', data)

//     /* ✅ UNIVERSAL NORMALIZATION */
//     return {
//       protein: Number(data?.['Protein (g)']) || 0,
//       carbs: Number(data?.['Carbohydrate, by difference (g)']) || 0,
//       fat: Number(data?.['Total lipid (fat) (g)']) || 0,
//     }

//   } catch (error) {
//     console.error('Nutrition ERROR:', error)

//     return {
//       protein: 0,
//       carbs: 0,
//       fat: 0,
//     }
//   }
// }

// /* -------------------------------------------------- */
// /* 📜 INSTRUCTIONS */
// /* -------------------------------------------------- */

// export async function getRecipeInstructions(recipeId: string) {
//   try {
//     console.log('INSTRUCTIONS REQUEST:', recipeId)

//     const res = await fetch(
//       `${BASE_URL}/instructions/${recipeId}`,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${API_KEY}`,
//         },
//       }
//     )

//     if (!res.ok) throw new Error('Instructions API failed')

//     const data = await res.json()

//     console.log('INSTRUCTIONS RAW:', data)

//     return {
//       instructions: data?.steps || [],
//     }

//   } catch (error) {
//     console.error('Instructions ERROR:', error)

//     return { instructions: [] }
//   }
// }

// /* -------------------------------------------------- */
// /* 🥦 DIET FILTER */
// /* -------------------------------------------------- */

// export async function getRecipesByDiet(
//   diet: string,
//   limit = 30
// ) {
//   try {
//     console.log('DIET REQUEST:', diet)

//     const res = await fetch(
//       `${DIET_BASE_URL}/recipe-diet?diet=${diet}&limit=${limit}`,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${API_KEY}`,
//         },
//       }
//     )

//     if (!res.ok) throw new Error('Diet API failed')

//     const data = await res.json()

//     console.log('DIET RAW:', data)

//     return {
//       recipes: data?.data || [],
//     }

//   } catch (error) {
//     console.error('Diet ERROR:', error)
//     return { recipes: [] }
//   }
// }

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

interface SmartSearchParams {
  query: string
  cuisine: string
}

function deriveDietType(recipe: any): string {
  if (!recipe) return "Non-Vegetarian"

  const vegan = Number(recipe.vegan) === 1
  const ovoVeg = Number(recipe.ovo_vegetarian) === 1
  const lactoVeg = Number(recipe.lacto_vegetarian) === 1
  const ovoLacto = Number(recipe.ovo_lacto_vegetarian) === 1
  const pesc = Number(recipe.pescetarian) === 1

  if (vegan) return "Vegan"
  if (ovoVeg || lactoVeg || ovoLacto) return "Vegetarian"
  if (pesc) return "Pescetarian"

  return ""
}
function extractTimeConstraint(query: string) {
  const lower = query.toLowerCase()

  // Match patterns like:
  // 5 min, 10 mins, 30 minutes, 1 hour, 2 hours
  const timeRegex = /(\d+)\s*(min|mins|minute|minutes|hour|hours)/i

  const match = lower.match(timeRegex)

  if (!match) return null

  let value = parseInt(match[1], 10)
  const unit = match[2]

  // Convert hours → minutes
  if (unit.startsWith("hour")) {
    value = value * 60
  }

  return { "maxTime": value }
}

function extractHealthConstraints(query: string) {
  const lower = query.toLowerCase()

  const filters: any = {}

  // Low calorie
  if (
    lower.includes("low cal") ||
    lower.includes("low calorie") ||
    lower.includes("light meal")
  ) {
    filters.maxCalories = 300
  }

  // High protein
  if (
    lower.includes("high protein") ||
    lower.includes("protein rich") ||
    lower.includes("protein-packed")
  ) {
    filters.minProtein = 20
  }

  return filters
}


function parseSearchIntent(query: string) {
  const time = extractTimeConstraint(query)
  const health = extractHealthConstraints(query)

  return {
    ...health,
    ...(time || {}),
  }
}




export async function smartSearch(params: SmartSearchParams) {
  const intentFilters = parseSearchIntent(params.query)
  console.log("🧠 Intent filters:", intentFilters)

  console.log("🔍 smartSearch called with params:", params)

  let recipes: any[] = []

  try {
    console.log("➡️ Using CUISINE endpoint")

    const parameters = new URLSearchParams({
      field: 'total_time',
      min: '0',
      max: '1000',
      continent: '',
      subRegion: '',
      page: '1',
      page_size: '3',
    })

    const cuisineUrl = `https://api.foodoscope.com/recipe2-api/recipes_cuisine/cuisine/${encodeURIComponent(
      params.cuisine
    )}?${parameters.toString()}`

    console.log("🌍 Cuisine URL:", cuisineUrl)

    const response = await fetch(cuisineUrl, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FOODOSCOPE_API_KEY}`,
      },
    })

    console.log("📡 Cuisine Status:", response.status)

    const data = await response.json()
    console.log("📦 Cuisine Raw Data:", data)

    recipes = data.data || []


    console.log("🧾 Recipes extracted:", recipes.length)

    // 2️⃣ Fetch detailed nutrition + instructions
    const detailedRecipes = await Promise.all(
      recipes.map(async (recipe: any, index: number) => {
        console.log(`\n🍳 Processing recipe ${index + 1}:`, recipe.Recipe_title)

        const detailUrl = `https://api.foodoscope.com/recipe2-api/search-recipe/${recipe.Recipe_id}`
        const instructionUrl = `https://api.foodoscope.com/recipe2-api/instructions/${recipe.Recipe_id}`

        console.log("   🔗 Detail URL:", detailUrl)
        console.log("   🔗 Instruction URL:", instructionUrl)

        const [detailResponse, instructionResponse] = await Promise.all([
          fetch(detailUrl, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.FOODOSCOPE_API_KEY}`,
            },
          }),
          fetch(instructionUrl, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.FOODOSCOPE_API_KEY}`,
            },
          }),
        ])

        console.log("   📡 Detail Status:", detailResponse.status)
        console.log("   📡 Instruction Status:", instructionResponse.status)

        const detailData = await detailResponse.json()
        const instructionData = await instructionResponse.json()

        console.log("   📦 Detail Data:", detailData)
        console.log("   📦 Instruction Data:", instructionData)

        const detailedRecipe = detailData.recipe
        const derivedDiet = deriveDietType(detailedRecipe)

        // Simple health score: lower cal + higher protein = healthier
        const cal = Number(detailedRecipe?.Calories || 0)
        const prot = Number(detailedRecipe?.['Protein (g)'] || 0)
        const calScore = Math.max(0, 100 - (cal / 8))       // lower calories → higher score
        const protScore = Math.min(prot * 2, 40)              // more protein → bonus
        const healthScore = Math.round(Math.min(100, Math.max(0, calScore + protScore)))

        const merged = {
          id: recipe._id,
          recipe_id: recipe.Recipe_id,
          recipe_name: recipe.Recipe_title,
          image: '',  // resolved client-side by dish-image-service
          healthScore,
          region: recipe.Region,
          calories: cal,
          protein: prot,
          carbs: Number(detailedRecipe?.['Carbohydrate, by difference (g)'] || 0),
          fat: Number(detailedRecipe?.['Total lipid (fat) (g)'] || 0),
          cookTime: recipe.cook_time,
          prepTime: recipe.prep_time,
          servings: detailedRecipe?.servings,
          dietType: derivedDiet,
          instructions: instructionData?.steps || [],
        }

        console.log("   ✅ Final merged object:", merged)

        return merged
      })
    )

    console.log("🎉 Final detailedRecipes array:", detailedRecipes)

    // 🧠 Apply filtering only if query contains constraints
    if (!params.query || params.query.trim() === "") {
      console.log("➡️ No query provided. Returning cuisine results only.")
      return detailedRecipes
    }

    if (Object.keys(intentFilters).length === 0) {
      console.log("➡️ Query has no structured constraints. Returning cuisine results.")
      return detailedRecipes
    }

    console.log("🔎 Applying intent-based filtering...")

    let filtered = detailedRecipes

    if (intentFilters.maxTime) {
      filtered = filtered.filter(
        (r) => Number(r.cookTime || 0) <= intentFilters.maxTime
      )
    }

    if (intentFilters.maxCalories) {
      filtered = filtered.filter(
        (r) => r.calories <= intentFilters.maxCalories
      )
    }

    if (intentFilters.minProtein) {
      filtered = filtered.filter(
        (r) => r.protein >= intentFilters.minProtein
      )
    }

    console.log("✅ Filtered results:", filtered)

    return filtered


  } catch (error) {
    console.error("❌ smartSearch error:", error)
    return []
  }
}

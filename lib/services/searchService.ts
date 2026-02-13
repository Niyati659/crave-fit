import { supabase } from "@/lib/supabase"


interface SmartSearchParams {
  query: string
  cuisine: string
}

function extractFoodName(query: string): string | null {
  if (!query) return null;

  let cleaned = query.toLowerCase();

  // Remove time expressions
  cleaned = cleaned.replace(/(\d+)\s*(min|mins|minute|minutes|hour|hours)/gi, "");
  // Remove calorie numbers or health stats
  cleaned = cleaned.replace(/\d+\s*(cal|calories|kcal|healthy|good|health)/gi, "");

  // Remove standalone numbers
  cleaned = cleaned.replace(/\b\d+\b/g, "");


  // Remove health keywords
  const keywords = [
    "low", "cal", "calorie", "calories",
    "high", "protein", "rich", "protein-packed",
    "under", "less", "than",
    "meal", "meals", "healthy", "light", "quick", "fast"
  ];

  keywords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    cleaned = cleaned.replace(regex, "");
  });

  cleaned = cleaned.trim();

  if (cleaned.length < 3) return null;

  return cleaned;
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

  const timeRegex = /(\d+)\s*(min|mins|minute|minutes|hour|hours)/i
  const match = lower.match(timeRegex)

  if (!match) return null

  let value = parseInt(match[1], 10)
  const unit = match[2]

  if (unit.startsWith("hour")) {
    value = value * 60
  }

  return { maxTime: value }
}

function extractCalorieConstraint(query: string) {
  const lower = query.toLowerCase()

  const filters: any = {}

  // Under / less than
  const underMatch = lower.match(
    /(under|below|less than)\s*(\d+)\s*(cal|calories|kcal)/
  )
  if (underMatch) {
    filters.maxCalories = parseInt(underMatch[2], 10)
    return filters
  }

  // Between / range (300-500 calories)
  const rangeMatch = lower.match(
    /(\d+)\s*(to|-)\s*(\d+)\s*(cal|calories|kcal)/
  )
  if (rangeMatch) {
    filters.minCalories = parseInt(rangeMatch[1], 10)
    filters.maxCalories = parseInt(rangeMatch[3], 10)
    return filters
  }

  // Around / approx
  const approxMatch = lower.match(
    /(around|about|approx|approximately)\s*(\d+)\s*(cal|calories|kcal)/
  )
  if (approxMatch) {
    const value = parseInt(approxMatch[2], 10)
    filters.minCalories = value - 50
    filters.maxCalories = value + 50
    return filters
  }

  return filters
}

function extractHealthConstraints(query: string) {
  const lower = query.toLowerCase()

  const filters: any = {}

  if (
    lower.includes("low cal") ||
    lower.includes("low calorie") ||
    lower.includes("light meal")
  ) {
    filters.maxCalories = 300
  }

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
  const calories = extractCalorieConstraint(query)

  return {
    ...health,
    ...calories,
    ...(time || {}),
  }
}




export async function smartSearch(params: SmartSearchParams) {
  const intentFilters = parseSearchIntent(params.query);
  const foodName = extractFoodName(params.query);

  console.log("🔍 smartSearch called with params:", params)

  let recipes: any[] = []

  try {
    let endpointUsed = "";

    // 1️⃣ Fetch base recipe list (unchanged)
    if (foodName) {
      endpointUsed = "TITLE";

      const titleUrl = `https://api.foodoscope.com/recipe2-api/recipe-bytitle/recipeByTitle?title=${encodeURIComponent(foodName)}`;

      const response = await fetch(titleUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_FOODOSCOPE_KEY}`,

        },
      });

      const data = await response.json();
      recipes = data.data || [];

    } else {
      endpointUsed = "CUISINE";

      const parameters = new URLSearchParams({
        field: 'total_time',
        min: '0',
        max: '1000',
        continent: '',
        subRegion: '',
        page: '1',
        page_size: '2',
      });

      const cuisineUrl = `https://api.foodoscope.com/recipe2-api/recipes_cuisine/cuisine/${encodeURIComponent(
        params.cuisine
      )}?${parameters.toString()}`;

      const response = await fetch(cuisineUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_FOODOSCOPE_KEY}`,
        },
      });

      const data = await response.json();
      recipes = data.data || [];
    }

    console.log(`📡 Endpoint used: ${endpointUsed}`);
    console.log("🧾 Recipes extracted:", recipes.length);

    if (recipes.length === 0) return [];

    // 2️⃣ Extract all recipe_ids
    const recipeIds = recipes.map(r => r.Recipe_id);

    // 3️⃣ Batch query Supabase
    const { data: dbRecipes, error: dbError } = await supabase
      .from("recipes")
      .select("*")
      .in("recipe_id", recipeIds);

    if (dbError) {
      console.error("❌ Supabase error:", dbError);
    }

    const dbMap = new Map(
      (dbRecipes || []).map(r => [r.recipe_id, r])
    );

    // 4️⃣ Identify missing IDs
    const missingRecipes = recipes.filter(
      r => !dbMap.has(r.Recipe_id)
    );

    console.log("🗄 Found in DB:", dbMap.size);
    console.log("🌐 Missing from DB:", missingRecipes.length);

    // 5️⃣ Fetch only missing from API
    const fetchedFromApi = await Promise.all(
      missingRecipes.map(async (recipe: any) => {
        const detailUrl = `https://api.foodoscope.com/recipe2-api/search-recipe/${recipe.Recipe_id}`;

        const detailResponse = await fetch(detailUrl, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_FOODOSCOPE_KEY}`,
          },
        });

        if (!detailResponse.ok) {
          console.error("Detail fetch failed:", recipe.Recipe_id);
          return null;
        }

        const detailData = await detailResponse.json();
        const detailedRecipe = detailData.recipe;

        const cal = Number(detailedRecipe?.Calories || 0);
        const prot = Number(detailedRecipe?.['Protein (g)'] || 0);

        const calScore = Math.max(0, 100 - (cal / 8));
        const protScore = Math.min(prot * 2, 40);
        const healthScore = Math.round(Math.min(100, Math.max(0, calScore + protScore)));

        return {
          recipe_id: recipe.Recipe_id,
          recipe_name: recipe.Recipe_title,
          region: recipe.Region,
          calories: Math.round(cal),
          protein: Math.round(prot),
          carbs: Math.round(Number(detailedRecipe?.['Carbohydrate, by difference (g)'] || 0)),
          fat: Math.round(Number(detailedRecipe?.['Total lipid (fat) (g)'] || 0)),
          cookTime: recipe.cook_time,
          prepTime: recipe.prep_time,
          servings: detailedRecipe?.servings,
          healthScore,
        };
      })
    );

    // Remove nulls if any failed
    const cleanApiResults = fetchedFromApi.filter(
  (r): r is NonNullable<typeof r> => r !== null
);


    // 6️⃣ Normalize DB results to same shape
    const normalizedDbResults = (dbRecipes || []).map(r => ({
      recipe_id: r.recipe_id,
      recipe_name: r.name,
      region: r.region,
      calories: Math.round(Number(r.calories || 0)),
      protein: Math.round(Number(r.protein || 0)),
      carbs: Math.round(Number(r.carbs || 0)),
      fat: Math.round(Number(r.fat || 0)),
      cookTime: r.cook_time,
      prepTime: r.prep_time,
      servings: r.servings,
      healthScore: Math.round(
        Math.min(
          100,
          Math.max(
            0,
            Math.max(0, 100 - (Number(r.calories || 0) / 8)) +
            Math.min(Number(r.protein || 0) * 2, 40)
          )
        )
      ),
    }));

    // 7️⃣ Merge
    const combined = [
      ...normalizedDbResults,
      ...cleanApiResults,
    ];

    console.log("🎉 Combined results:", combined.length);

    // 8️⃣ Apply filters at end
    if (!params.query || Object.keys(intentFilters).length === 0) {
      return combined;
    }

    let filtered = combined;

    if (intentFilters.maxTime) {
      filtered = filtered.filter(
        r => Number(r.cookTime || 0) <= intentFilters.maxTime
      );
    }

    if (intentFilters.maxCalories) {
      filtered = filtered.filter(
        r => r.calories <= intentFilters.maxCalories
      );
    }

    if (intentFilters.minCalories) {
      filtered = filtered.filter(
        r => r.calories >= intentFilters.minCalories
      );
    }

    if (intentFilters.minProtein) {
      filtered = filtered.filter(
        r => r.protein >= intentFilters.minProtein
      );
    }

    console.log("✅ Filtered results:", filtered.length);

    return filtered;

  } catch (error) {
    console.error("❌ smartSearch error:", error);
    return [];
  }
}

import { supabase } from './supabase'

export interface Ingredient {
    name: string
    quantity: string
    unit: string
    phrase: string
}

export interface Recipe {
    id?: string
    recipe_id?: string
    name: string
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
    cook_time?: number
    prep_time?: number
    servings?: number
    region?: string
    continent?: string
    instructions: string[]
    ingredients: Ingredient[]
}

const FOODOSCOPE_BASE_URL = `${process.env.BASE_URL}/recipe2-api`
const API_KEY = process.env.NEXT_PUBLIC_FOODOSCOPE_KEY

export async function getRecipeByTitle(title: string): Promise<Recipe | null> {
    try {
        // 1. Check local DB first
        const { data: localRecipe, error: dbError } = await supabase
            .from('recipes')
            .select('*')
            .ilike('name', `%${title}%`)
            .limit(1)
            .single()

        if (localRecipe && !dbError && localRecipe.ingredients && localRecipe.ingredients.length > 0) {
            return localRecipe as Recipe
        }

        // 2. Fallback to Foodoscope API 1 (Search by title)
        const searchRes = await fetch(`${FOODOSCOPE_BASE_URL}/recipe-bytitle/recipeByTitle?title=${encodeURIComponent(title)}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        })
        const searchData = await searchRes.json()

        if (!searchData.success || !searchData.data || searchData.data.length === 0) {
            return null
        }

        // Pick the first result
        const bestMatch = searchData.data[0]
        const recipeId = bestMatch.Recipe_id

        // 3. Call Foodoscope API 2 (Details: Ingredients & Macros)
        const detailRes = await fetch(`${FOODOSCOPE_BASE_URL}/search-recipe/${recipeId}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        })
        const detailData = await detailRes.json()

        // 4. Call Foodoscope API 3 (Instructions)
        const instRes = await fetch(`${FOODOSCOPE_BASE_URL}/instructions/${recipeId}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        })
        const instData = await instRes.json()

        const recipeInfo = detailData.recipe || bestMatch
        const apiIngredients = detailData.ingredients || []
        const steps = instData.steps || []

        // 5. Map to our structure
        const newRecipe: Omit<Recipe, 'id'> = {
            recipe_id: recipeId,
            name: recipeInfo.Recipe_title || bestMatch.Recipe_title,
            calories: parseFloat(recipeInfo['Energy (kcal)']) || parseFloat(recipeInfo.Calories) || 0,
            protein: parseFloat(recipeInfo['Protein (g)']) || 0,
            carbs: parseFloat(recipeInfo['Carbohydrate, by difference (g)']) || 0,
            fat: parseFloat(recipeInfo['Total lipid (fat) (g)']) || 0,
            fiber: parseFloat(recipeInfo.fiber) || 0,
            cook_time: parseInt(recipeInfo.cook_time) || 0,
            prep_time: parseInt(recipeInfo.prep_time) || 0,
            servings: parseInt(recipeInfo.servings) || 0,
            region: recipeInfo.Region,
            continent: recipeInfo.Continent,
            instructions: steps,
            ingredients: apiIngredients.map((ing: any) => ({
                name: ing.ingredient,
                quantity: ing.quantity || '0',
                unit: ing.unit || '',
                phrase: ing.ingredient_Phrase || ing.ingredient
            }))
        }

        // 6. Cache to DB (Upsert to update existing records with missing data)
        const { data: cachedRecipe, error: cacheError } = await supabase
            .from('recipes')
            .upsert([newRecipe], { onConflict: 'recipe_id' })
            .select()
            .single()

        if (cacheError) {
            console.error('Error caching recipe:', cacheError)
        }

        return (cachedRecipe || newRecipe) as Recipe
    } catch (error) {
        console.error('Error in getRecipeByTitle:', error)
        return null
    }
}

export async function getRecipesByEnergy(minEnergy: number, maxEnergy: number, limit: number = 3): Promise<Recipe[]> {
    try {
        const url = `${FOODOSCOPE_BASE_URL}/byenergy/energy?minEnergy=${minEnergy}&maxEnergy=${maxEnergy}&page=1&limit=${limit}`
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        })
        const data = await res.json()

        // Based on user snippet, the key is 'recipes' for the energy endpoint
        const recipeList = data.recipes || data.data || []

        if (recipeList.length === 0) {
            return []
        }

        return recipeList.map((recipeInfo: any) => ({
            recipe_id: recipeInfo.Recipe_id,
            name: recipeInfo.Recipe_title,
            calories: parseFloat(recipeInfo['Energy (kcal)']) || parseFloat(recipeInfo.Calories) || 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            instructions: [],
            ingredients: []
        }))
    } catch (error) {
        console.error('Error in getRecipesByEnergy:', error)
        return []
    }
}

export async function getRecipesByCarbs(minCarbs: number, maxCarbs: number, limit: number = 3): Promise<Recipe[]> {
    try {
        // endpoint according to user pattern: /bycarb/carb?minCarb={minCarb}&maxCarb={maxCarb}
        const url = `${FOODOSCOPE_BASE_URL}/bycarb/carb?minCarb=${minCarbs}&maxCarb=${maxCarbs}&page=1&limit=${limit}`
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        })
        const data = await res.json()

        // Based on user snippet, the key is 'data' for the carb endpoint
        const recipeList = data.data || data.recipes || []

        if (recipeList.length === 0) {
            return []
        }

        return recipeList.map((recipeInfo: any) => ({
            recipe_id: recipeInfo.Recipe_id,
            name: recipeInfo.Recipe_title,
            calories: parseFloat(recipeInfo.Calories) || parseFloat(recipeInfo['Energy (kcal)']) || 0,
            protein: 0,
            carbs: parseFloat(recipeInfo['Carbohydrate, by difference (g)']) || 0,
            fat: 0,
            instructions: [],
            ingredients: []
        }))
    } catch (error) {
        console.error('Error in getRecipesByCarbs:', error)
        return []
    }
}

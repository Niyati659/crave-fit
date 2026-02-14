import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface RecipeCard {
  title: string
  imageUrl: string
}

async function getRecipeSuggestionsFromGemini(ingredient1: string, ingredient2: string): Promise<string[]> {
  const apiKey = process.env.NEXT_PUBLIC_MODEL_API_KEY

  if (!apiKey) {
    console.error('❌ Gemini API key not configured')
    return []
  }

  try {
    // 🔑 Configure Gemini with API key
    const genAI = new GoogleGenerativeAI(apiKey)

    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Create prompt to generate 2 recipe titles
    const prompt = `You are a professional chef.

Generate 2 realistic and edible recipe titles that can be made using these 2 ingredients: ${ingredient1} and ${ingredient2}.

Include:
1. Recipe Title (2-4 words)
2. Recipe Title (2-4 words)

Keep it structured and clear. Reply with ONLY the recipe titles, one per line. Do not include numbers or bullets.`

    console.log(`🧠 Generating recipes for ${ingredient1} + ${ingredient2}`)

    // Generate content
    const response = await model.generateContent(prompt)
    const text = response.response.text()

    console.log(`📝 Raw response:\n${text}`)

    // Parse the response to extract recipe titles
    const recipes = text
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0 && !line.match(/^[\d.]/)) // Remove numbers/bullets
      .slice(0, 2) // Take first 2
      .map((line: string) => line.replace(/^[-•*]\s+/, '')) // Remove any remaining bullets

    console.log(`✅ Extracted recipes:`, recipes)

    return recipes.length > 0 ? recipes : []
  } catch (error) {
    console.error('❌ Gemini API error:', error)
    return []
  }
}

async function getRecipeImage(recipeTitle: string): Promise<string> {
  const pexelsKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY

  if (!pexelsKey) {
    return '/chef/S1.png' // Fallback
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(recipeTitle)}&per_page=1&page=1`,
      {
        headers: {
          Authorization: pexelsKey
        }
      }
    )

    const data = await response.json()

    if (data.photos && data.photos[0]?.src?.medium) {
      return data.photos[0].src.medium
    }
  } catch (error) {
    console.error('❌ Pexels API error:', error)
  }

  return '/chef/S1.png' // Fallback
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ingredient1, ingredient2 } = body

    if (!ingredient1 || !ingredient2) {
      return NextResponse.json(
        { error: 'Missing ingredients' },
        { status: 400 }
      )
    }

    console.log(`🍳 Generating recipe suggestions for ${ingredient1} + ${ingredient2}`)

    // Get recipe titles from Gemini
    const recipeTitles = await getRecipeSuggestionsFromGemini(ingredient1, ingredient2)

    if (recipeTitles.length === 0) {
      console.log('⚠️ No recipes generated from Gemini')
      return NextResponse.json({ recipes: [] })
    }

    console.log(`✅ Generated recipes:`, recipeTitles)

    // Get images for each recipe
    const recipes: RecipeCard[] = await Promise.all(
      recipeTitles.map(async (title) => {
        const imageUrl = await getRecipeImage(title)
        return {
          title,
          imageUrl
        }
      })
    )

    console.log(`🖼️ Fetched images for ${recipes.length} recipes`)

    return NextResponse.json({ recipes })
  } catch (error) {
    console.error('❌ Recipe generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recipes', recipes: [] },
      { status: 500 }
    )
  }
}

export interface RecipeCard {
  title: string
  imageUrl: string
}

export async function getRecipeSuggestions(ingredient1: string, ingredient2: string): Promise<RecipeCard[]> {
  try {
    const res = await fetch('/api/recipe-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ingredient1, ingredient2 })
    })

    const data = await res.json()
    return data.recipes || []
  } catch (error) {
    console.error('Recipe suggestions error:', error)
    return []
  }
}

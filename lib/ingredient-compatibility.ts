export interface CompatibilityResult {
  match: boolean
  score: number
  shared_molecules: number
  verdict: string
  error?: string
}

export async function checkFlavorCompatibility(
  ingredient1: string,
  ingredient2: string
): Promise<CompatibilityResult> {
  try {
    const params = new URLSearchParams({
      ingredient1: ingredient1.trim(),
      ingredient2: ingredient2.trim()
    })

    const res = await fetch(`/api/ingredient-compatibility?${params}`)
    const data = await res.json()

    return data
  } catch (error) {
    console.error('Compatibility check error:', error)
    return {
      match: false,
      score: 0,
      shared_molecules: 0,
      verdict: 'Error checking compatibility',
      error: String(error)
    }
  }
}

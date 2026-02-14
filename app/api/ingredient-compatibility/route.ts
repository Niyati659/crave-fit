import { NextRequest, NextResponse } from 'next/server'

// =========================================
// 🧠 ALIAS / PROXY MAPPING
// =========================================

const aliasMap: Record<string, string> = {
  // 🍓 Berries → Apple proxy
  strawberry: 'Apple',
  blueberry: 'Apple',
  raspberry: 'Apple',
  blackberry: 'Apple',

  // 🍍 Sweet fruits → Mango proxy
  banana: 'Mango',
  papaya: 'Mango',
  pineapple: 'Mango',
  kiwi: 'Mango',
  chikoo: 'Mango',

  // 🍊 Citrus → Orange proxy
  lemon: 'Orange',
  lime: 'Orange',

  // 🥛 Dairy → Milk proxy
  paneer: 'Milk',
  curd: 'Milk',
  yogurt: 'Milk',
  butter: 'Milk',
  cream: 'Milk',

  // 🍫 Chocolate → Coffee proxy
  chocolate: 'Coffee',
  cocoa: 'Coffee',

  // 🥤 Soft drinks → Beer proxy
  coke: 'Beer',
  cola: 'Beer',
  'soft drink': 'Beer',
  soda: 'Beer',

  // 💧 Neutral / special
  water: 'WATER',
  salt: 'NEUTRAL',
  sugar: 'NEUTRAL'
}

// =========================================
// 🧠 CULINARY BOOST (DOMAIN KNOWLEDGE)
// =========================================

const culinaryBoostPairs: Set<string> = new Set([
  'Mango|Milk',
  'Milk|Mango',
  'Apple|Milk',
  'Milk|Apple',
  'Banana|Milk',
  'Milk|Banana',
  'Coffee|Milk',
  'Milk|Coffee',
  'Chocolate|Milk',
  'Milk|Chocolate',
  'Mango|Strawberry',
  'Strawberry|Mango',
  'Lemon|Ginger',
  'Ginger|Lemon',
  'Basil|Tomato',
  'Tomato|Basil',
  'Garlic|Onion',
  'Onion|Garlic'
])

// =========================================
// 🧠 HELPERS
// =========================================

function resolveAlias(ingredient: string): string {
  const key = ingredient.toLowerCase().trim()
  return aliasMap[key] || ingredient.charAt(0).toUpperCase() + ingredient.slice(1).toLowerCase()
}

function handleSpecialCases(ing1: string, ing2: string): { score: number; molecules: number; verdict: string } | null {
  if (ing1 === 'WATER' || ing2 === 'WATER') {
    return { score: 60, molecules: 0, verdict: 'Neutral Interaction 💧' }
  }
  if (ing1 === 'NEUTRAL' || ing2 === 'NEUTRAL') {
    return { score: 50, molecules: 0, verdict: 'Neutral Ingredient Balance ⚖️' }
  }
  return null
}

function applyCulinaryBoost(ing1: string, ing2: string, score: number): number {
  const key1 = `${ing1}|${ing2}`
  const key2 = `${ing2}|${ing1}`

  if (culinaryBoostPairs.has(key1) || culinaryBoostPairs.has(key2)) {
    return Math.max(score, 75)
  }
  return score
}

function interpretScore(score: number): string {
  if (score >= 75) {
    return '✅ Excellent Pairing'
  }
  if (score >= 55) {
    return '😌 Good Compatibility'
  }
  if (score >= 35) {
    return '🤔 Moderate Synergy'
  }
  return '⚠️ Weak Flavor Similarity'
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ingredient1 = searchParams.get('ingredient1')
  const ingredient2 = searchParams.get('ingredient2')

  if (!ingredient1 || !ingredient2) {
    return NextResponse.json({
      match: false,
      score: 0,
      shared_molecules: 0,
      verdict: 'Please enter both ingredients',
      error: 'Missing ingredients'
    })
  }

  const apiKey = process.env.NEXT_PUBLIC_INGREDIENT_COMPATIBILITY_KEY

  if (!apiKey) {
    return NextResponse.json({
      match: false,
      score: 0,
      shared_molecules: 0,
      verdict: 'Configuration Error',
      error: 'API key not configured'
    })
  }

  try {
    const proxy1 = resolveAlias(ingredient1)
    const proxy2 = resolveAlias(ingredient2)

    console.log(`🔍 Checking: ${ingredient1} (${proxy1}) + ${ingredient2} (${proxy2})`)

    // Check special cases first
    const special = handleSpecialCases(proxy1, proxy2)
    if (special) {
      console.log(`💧 Special case: ${special.verdict}`)
      return NextResponse.json({
        match: special.score >= 55,
        score: special.score,
        shared_molecules: special.molecules,
        verdict: special.verdict
      })
    }

    // Fetch flavor score from FoodOscope API
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    }

    const url = `${process.env.FLAVORDB_URL}/food/by-alias?food_pair=${proxy1}`
    console.log(`🔗 Fetching: ${url}`)

    const res = await fetch(url, { headers })
    const data = await res.json()

    let flavorScore = 40 // Fallback score
    let molecules = 0

    for (const item of data.topSimilarEntities || []) {
      if (item.entityName.toLowerCase() === proxy2.toLowerCase()) {
        molecules = item.similarMolecules || 0
        flavorScore = Math.min(molecules / 200, 1.0) * 100
        console.log(`✨ Found ${item.entityName} with ${molecules} molecules (${flavorScore}%)`)
        break
      }
    }

    // Apply culinary boost
    let finalScore = applyCulinaryBoost(proxy1, proxy2, flavorScore)
    console.log(`🍳 After culinary boost: ${finalScore}%`)

    // Interpret score
    const verdict = interpretScore(finalScore)
    console.log(`📊 Verdict: ${verdict}`)

    return NextResponse.json({
      match: finalScore >= 55,
      score: Math.round(finalScore * 100) / 100,
      shared_molecules: molecules,
      verdict
    })
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json({
      match: false,
      score: 0,
      shared_molecules: 0,
      verdict: 'Error checking compatibility',
      error: String(error)
    })
  }
}

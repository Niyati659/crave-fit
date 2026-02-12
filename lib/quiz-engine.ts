// // ⭐ Base calorie logic from hunger
// function deriveBaseCalorieRange(hunger?: string) {
//   if (!hunger) return { min: 250, max: 650 }

//   const h = hunger.toLowerCase()

//   if (h.includes('snack'))
//     return { min: 150, max: 400 }

//   if (h.includes('small'))
//     return { min: 350, max: 650 }

//   if (h.includes('full'))
//     return { min: 600, max: 1000 }

//   return { min: 300, max: 800 } // safe fallback
// }

// // ⭐ Health slider intelligence
// function tightenRangeByHealth(
//   range: { min: number; max: number },
//   healthPreference: number
// ) {
//   const midpoint = (range.min + range.max) / 2
//   const spread = range.max - range.min

//   // Strict healthy → tighter band
//   if (healthPreference >= 70) {
//     return {
//       min: Math.round(midpoint - spread * 0.25),
//       max: Math.round(midpoint + spread * 0.25),
//     }
//   }

//   // Indulgent → wider band
//   if (healthPreference <= 30) {
//     return {
//       min: Math.round(midpoint - spread * 0.6),
//       max: Math.round(midpoint + spread * 0.6),
//     }
//   }

//   return range
// }

// export function generateCravingProfile(
//   answers: Record<string, string>,
//   healthPreference = 50
// ) {
//   const texture = answers.texture
//   const taste = answers.taste
//   const hunger = answers.hunger
//   const diet = answers.diet

//   const baseRange = deriveBaseCalorieRange(hunger)

//   const adjustedRange = tightenRangeByHealth(
//     baseRange,
//     healthPreference
//   )

//   const cravingProfile =
//     `You're craving something ${texture} & ${taste}`

//   const reasons = [
//     hunger ? `Calories aligned with ${hunger}` : 'Calorie-balanced meals',
//     diet && diet !== 'Anything'
//       ? `${diet} friendly meals`
//       : 'Balanced meal selection',
//     healthPreference >= 70
//       ? 'Optimized for healthier choices'
//       : healthPreference <= 30
//         ? 'Allowing indulgent flexibility'
//         : 'Balanced nutrition logic',
//   ]

//   return {
//     cravingProfile,
//     calorieRange: adjustedRange,
//     dietFilter: diet?.toLowerCase(),
//     reasons,
//   }
// }

/* -------------------------------------------------- */
/* ⭐ Base calorie logic from hunger */
/* -------------------------------------------------- */

function deriveBaseCalorieRange(hunger?: string) {
  if (!hunger) return { min: 250, max: 650 }

  const h = hunger.toLowerCase()

  if (h.includes('snack'))
    return { min: 150, max: 350 }

  if (h.includes('small'))
    return { min: 350, max: 600 }

  if (h.includes('full'))
    return { min: 550, max: 900 }

  return { min: 300, max: 750 }
}

/* -------------------------------------------------- */
/* ⭐ Health slider intelligence */
/* -------------------------------------------------- */

function tightenRangeByHealth(
  range: { min: number; max: number },
  healthPreference: number
) {
  const midpoint = (range.min + range.max) / 2
  const spread = range.max - range.min

  if (healthPreference >= 70) {
    return {
      min: Math.round(midpoint - spread * 0.25),
      max: Math.round(midpoint + spread * 0.25),
    }
  }

  if (healthPreference <= 30) {
    return {
      min: Math.round(midpoint - spread * 0.6),
      max: Math.round(midpoint + spread * 0.6),
    }
  }

  return range
}

/* -------------------------------------------------- */
/* ⭐ Mood Engine */
/* -------------------------------------------------- */

function deriveMoodAdjustments(mood?: string) {
  if (!mood) return {}

  switch (mood.toLowerCase()) {
    case 'tired':
      return {
        calorieMultiplier: 1.1,
        maxPrepTime: 20,
      }

    case 'stressed':
      return {
        calorieMultiplier: 1.15,
        comfortBias: true,
      }

    case 'energetic':
      return {
        proteinTarget: 30,
      }

    case 'bored':
      return {
        varietyBias: true,
      }

    default:
      return {}
  }
}

/* -------------------------------------------------- */
/* ⭐ Diet Intelligence */
/* -------------------------------------------------- */

function deriveDietLogic(diet?: string) {
  if (!diet) return {}

  switch (diet.toLowerCase()) {
    case 'high protein':
      return {
        proteinTarget: 35,
      }

    case 'vegan':
      return {
        dietFilter: 'vegan',
      }

    case 'vegetarian':
      return {
        dietFilter: 'vegetarian',
      }

    default:
      return {
        dietFilter: diet.toLowerCase(),
      }
  }
}

/* -------------------------------------------------- */
/* ⭐ Sweet / Savory Intelligence */
/* -------------------------------------------------- */

function deriveTasteAdjustments(taste?: string) {
  if (!taste) return {}

  switch (taste.toLowerCase()) {
    case 'sweet':
      return {
        calorieMultiplier: 1.1,
        proteinBias: 0.7,
        sweetBias: true,
      }

    case 'savory':
      return {
        proteinBias: 1.3,
        savoryBias: true,
      }

    default:
      return {}
  }
}

/* -------------------------------------------------- */
/* ⭐ MAIN ENGINE */
/* -------------------------------------------------- */

export function generateCravingProfile(
  answers: Record<string, string>,
  healthPreference = 50
) {

  const mood = answers.mood
  const texture = answers.texture
  const taste = answers.taste
  const hunger = answers.hunger
  const diet = answers.diet

  const baseRange = deriveBaseCalorieRange(hunger)

  const adjustedRange = tightenRangeByHealth(
    baseRange,
    healthPreference
  )

  const moodAdjustments = deriveMoodAdjustments(mood)
  const dietLogic = deriveDietLogic(diet)
  const tasteAdjustments = deriveTasteAdjustments(taste)

  /* ✅ Final Calories Range */
  const finalRange = {
    min: Math.round(
      adjustedRange.min *
      (moodAdjustments.calorieMultiplier || 1) *
      (tasteAdjustments.calorieMultiplier || 1)
    ),
    max: Math.round(
      adjustedRange.max *
      (moodAdjustments.calorieMultiplier || 1) *
      (tasteAdjustments.calorieMultiplier || 1)
    ),
  }

  /* ✅ Protein Intelligence */
  const proteinTarget = Math.round(
    (
      dietLogic.proteinTarget ||
      moodAdjustments.proteinTarget ||
      25
    ) * (tasteAdjustments.proteinBias || 1)
  )

  const cravingProfile =
    `You're craving something ${texture} & ${taste}`

  const reasons = [
    hunger ? `Calories aligned with ${hunger}` : 'Calorie-balanced meals',

    mood ? `Optimized for your ${mood.toLowerCase()} mood` : null,

    diet ? `${diet} friendly meals` : 'Balanced meal selection',

    taste === 'Sweet'
      ? 'Allowing indulgent sweet options'
      : taste === 'Savory'
        ? 'Prioritizing satisfying savory meals'
        : null,

    healthPreference >= 70
      ? 'Optimized for healthier choices'
      : healthPreference <= 30
        ? 'Allowing indulgent flexibility'
        : 'Balanced nutrition logic',
  ].filter(Boolean)

  return {
    cravingProfile,

    calorieRange: finalRange,

    proteinTarget,

    maxPrepTime:
      moodAdjustments.maxPrepTime || 35,

    dietFilter:
      dietLogic.dietFilter || null,

    sweetBias:
      tasteAdjustments.sweetBias || false,

    savoryBias:
      tasteAdjustments.savoryBias || false,

    reasons,
  }
}



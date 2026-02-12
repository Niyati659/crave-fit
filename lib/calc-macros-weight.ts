interface MacroInput {
  calories: number
  weight: number
  goal: "weight_loss" | "maintenance" | "muscle_gain"
}

export function calcMacrosFromWeight({
  calories,
  weight,
  goal,
}: MacroInput) {
  // 🥩 Protein factor
  let proteinFactor = 1.2
  let fatPercent = 0.25

  if (goal === "weight_loss") {
    proteinFactor = 1.6
    fatPercent = 0.25
  }

  if (goal === "muscle_gain") {
    proteinFactor = 2.0
    fatPercent = 0.20
  }

  // 1️⃣ Protein grams
  const protein = Math.round(weight * proteinFactor)

  // 2️⃣ Fat grams
  const fatCalories = calories * fatPercent
  const fat = Math.round(fatCalories / 9)

  // 3️⃣ Remaining calories for carbs
  const usedCalories =
    protein * 4 + fat * 9

  const carbs = Math.round(
    (calories - usedCalories) / 4
  )

  return {
    protein,
    carbs,
    fat,
  }
}

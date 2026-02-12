// 🔹 Define user profile type
export interface UserProfile {
  height: number
  weight: number
  age: number
  gender: "male" | "female"
  goal: "loss" | "maintain" | "gain" | string
  target_weight?: number
  goal_timeline?: string // months as a string (e.g. "3", "6", "12")
}

// 🔹 Constants
const MIN_SAFE_CALORIES = 1200;

// 🔥 Calorie calculation function
// Uses the Mifflin-St Jeor BMR formula, then adjusts based on:
//   - Weight gap (current vs target)
//   - Timeline (how quickly to reach target)
// Formula: deficit/surplus = (gap_kg × 7700 kcal/kg) / (timeline_months × 30 days)
// Clamped to 200–750 kcal/day for safety.
export function calcCalories(user: UserProfile): { goal: number; exerciseGap: number } {
  const bmr =
    user.gender === "male"
      ? 10 * user.weight + 6.25 * user.height - 5 * user.age + 5
      : 10 * user.weight + 6.25 * user.height - 5 * user.age - 161

  // Auto-detect goal direction from target weight
  let effectiveGoal = user.goal
  if (user.target_weight && user.target_weight !== user.weight) {
    effectiveGoal = user.target_weight < user.weight ? "loss" : "gain"
  }

  // Calculate deficit/surplus from weight gap + timeline
  const timelineMonths = user.goal_timeline ? parseFloat(user.goal_timeline) : 3
  const timelineDays = Math.max(timelineMonths * 30, 30) // at least 30 days

  let targetCalories = bmr;

  if (effectiveGoal === "loss" || effectiveGoal === "weight_loss") {
    const gapKg = user.target_weight ? Math.abs(user.weight - user.target_weight) : 5
    const dailyDeficit = (gapKg * 7700) / timelineDays
    const clampedDeficit = Math.min(750, Math.max(200, dailyDeficit))
    targetCalories = bmr - clampedDeficit;
  } else if (effectiveGoal === "gain" || effectiveGoal === "weight_gain") {
    const gapKg = user.target_weight ? Math.abs(user.target_weight - user.weight) : 5
    const dailySurplus = (gapKg * 7700) / timelineDays
    const clampedSurplus = Math.min(750, Math.max(200, dailySurplus))
    targetCalories = bmr + clampedSurplus;
  }

  const roundedTarget = Math.round(targetCalories);

  if (roundedTarget < MIN_SAFE_CALORIES) {
    return {
      goal: MIN_SAFE_CALORIES,
      exerciseGap: MIN_SAFE_CALORIES - roundedTarget
    };
  }

  return {
    goal: roundedTarget,
    exerciseGap: 0
  };
}



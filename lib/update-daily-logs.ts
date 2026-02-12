import { supabase } from "@/lib/supabase"
import { calcCalories } from "@/lib/calc-calories"

export async function updateDailyLogs(
  userId: string,
  date: string
) {
  // 1️⃣ Get meals
  const { data: meals, error } = await supabase
    .from("meals")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)

  if (error) {
    console.error("Fetch meals error:", error)
    return
  }

  // 2️⃣ Aggregate totals
  const totals = (meals || []).reduce(
    (acc, meal) => {
      acc.calories += Number(meal.calories) || 0
      acc.protein += Number(meal.protein) || 0
      acc.carbs += Number(meal.carbs) || 0
      acc.fat += Number(meal.fat) || 0
      acc.fiber += Number(meal.fiber) || 0
      return acc
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    }
  )

  // ⭐ Round
  totals.calories = Number(totals.calories.toFixed(1))
  totals.protein = Number(totals.protein.toFixed(1))
  totals.carbs = Number(totals.carbs.toFixed(1))
  totals.fat = Number(totals.fat.toFixed(1))
  totals.fiber = Number(totals.fiber.toFixed(1))

  // 3️⃣ Fetch profile → get calorie goal
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (profileError || !profile) {
    console.error("Profile fetch error:", profileError)
    return
  }

  const { goal: calorieGoal } = calcCalories(profile)

  // 4️⃣ Upsert logs
  const { error: upsertError } = await supabase
    .from("daily_logs")
    .upsert(
      {
        user_id: userId,
        date,
        calories_goal: calorieGoal,   // ⭐ FIX
        calories_consumed: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
        fiber: totals.fiber,
      },
      {
        onConflict: "user_id,date",   // prevent duplicates
      }
    )

  if (upsertError) {
    console.error("Daily logs update error:", upsertError)
  }
}

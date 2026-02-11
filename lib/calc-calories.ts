// 🔹 Define user profile type
export interface UserProfile {
  height: number
  weight: number
  age: number
  gender: "male" | "female"
  goal: "loss" | "maintain" | "gain"
}

// 🔥 Calorie calculation function
export function calcCalories(user: UserProfile) {
  let bmr =
    user.gender === "male"
      ? 10 * user.weight + 6.25 * user.height - 5 * user.age + 5
      : 10 * user.weight + 6.25 * user.height - 5 * user.age - 161

  if (user.goal === "loss") return Math.round(bmr - 400)
  if (user.goal === "gain") return Math.round(bmr + 400)

  return Math.round(bmr)
}

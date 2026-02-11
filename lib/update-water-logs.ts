import { supabase } from "@/lib/supabase"

export async function updateWaterLogs(
  userId: string,
  date: string,
  addedMl: number
) {
  // 1️⃣ Get existing log
  const { data: existing } = await supabase
    .from("water_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .single()

  if (!existing) {
    // 2️⃣ Create new
    await supabase.from("water_logs").insert({
      user_id: userId,
      date,
      ml: addedMl,
      glasses: Math.round(addedMl / 250),
    })
  } else {
    // 3️⃣ Update existing
    await supabase
      .from("water_logs")
      .update({
        ml: existing.ml + addedMl,
        glasses: Math.round((existing.ml + addedMl) / 250),
      })
      .eq("id", existing.id)
  }
}

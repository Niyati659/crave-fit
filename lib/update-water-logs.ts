import { supabase } from "@/lib/supabase"

export async function updateWaterLogs(
  userId: string,
  date: string,
  ml: number
) {
  const { error } = await supabase
    .from("water_logs")
    .insert({
      user_id: userId,
      date,
      ml,
    })

  if (error) {
    console.error("Water log insert error:", error)
  }
}

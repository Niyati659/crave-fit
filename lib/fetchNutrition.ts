export async function fetchNutritionRecipes() {
  const allData: any[] = []

  for (let page = 1; page <= 5; page++) {
    const res = await fetch(
      `https://api.foodoscope.com/recipe2-api/recipe-nutri/nutritioninfo?page=${page}&limit=500`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_FOODOSCOPE_KEY}`,
        },
      }
    )

    const json = await res.json()

    const rows =
      json?.payload?.data || []

    allData.push(...rows)
  }

  return allData
}

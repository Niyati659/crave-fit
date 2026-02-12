export function aggregateNutrition(data:any[]) {
    const map: Record<string, any> = {}

  data.forEach(item => {
    const id = item.Recipe_id

    if (!map[id]) {
      map[id] = {
        id,
        title: item.recipeTitle,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        calories: 0,
      }
    }

    map[id].protein += Number(item["Protein (g)"] || 0)
    map[id].carbs += Number(
      item["Carbohydrate, by difference (g)"] || 0
    )
    map[id].fats += Number(
      item["Total lipid (fat) (g)"] || 0
    )
    map[id].fiber += Number(
      item["Fiber, total dietary (g)"] || 0
    )
    map[id].calories += Number(
      item["Energy (kcal)"] || 0
    )
  })

  return Object.values(map)
}

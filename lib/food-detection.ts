export async function detectFoodFromImage(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch("http://localhost:8000/predict", {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    throw new Error("Detection API failed")
  }

  const data = await res.json()

  if (!data.label) {
    throw new Error("No food detected")
  }

  return data.label
}

console.log(
  "Gemini Key Exists:",
  !!process.env.GEMINI_API_KEY
)

import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
)
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Substitutes route working"
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const ingredient = body.ingredient
    const recipe_ingredients =
      body.recipe_ingredients || []

    if (!ingredient) {
      return NextResponse.json(
        { error: "Ingredient required" },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    })

    const prompt = `
You are a professional chef.

Suggest cooking substitutes for: ${ingredient}

Recipe context ingredients:
${recipe_ingredients.join(", ")}

Return ONLY JSON:

{
  "substitutes": ["sub1", "sub2", "sub3"]
}
`

    const result =
      await model.generateContent(prompt)

    const text = result.response.text()
    console.log("Gemini Raw Response:", text)

    const clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim()
    
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)

  } catch (error) {
    console.error("Gemini API Error:", error)

    return NextResponse.json(
      { substitutes: [] },
      { status: 200 }
    )
  }
}

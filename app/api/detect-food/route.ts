import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file received" },
        { status: 400 }
      )
    }

    // Convert file → base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`

    // 🔥 Replicate API call (BLIP caption model)
    const replicateRes = await fetch(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  version:
    "4b32258a3c5bdb8f7eab64f9a1a7b5a3ec8a0c57e3f97b3d3e5d1c9f0e0b9a2f",
  input: {
    image: base64Image,
  },
}),

      }
    )

    const prediction = await replicateRes.json()
let result = prediction

while (result.status === "starting" || result.status === "processing") {
  console.log("⏳ Waiting for Replicate result...")

  await new Promise((r) => setTimeout(r, 2000))

  const pollRes = await fetch(
    `https://api.replicate.com/v1/predictions/${result.id}`,
    {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
    }
  )

  result = await pollRes.json()
}

console.log("✅ Final Replicate result:", result)


    if (result.status === "failed") {
      return NextResponse.json(
        { error: "Detection failed" },
        { status: 500 }
      )
    }

    // 🧠 Caption text
   let caption = "food"

if (Array.isArray(result.output)) {
  caption = result.output[0]
} else if (typeof result.output === "string") {
  caption = result.output
}

console.log("🍕 Caption:", caption)


    return NextResponse.json({
      label: caption,
    })

  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { error: "Detection failed" },
      { status: 500 }
    )
  }
}

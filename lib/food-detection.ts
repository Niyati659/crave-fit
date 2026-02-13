export async function detectFoodFromImage(file: File) {
  const BASE_URL = process.env.NEXT_PUBLIC_GRADIO_BASE_URL || "https://xyz12343-cravefit-inference.hf.space/gradio_api"
  const UPLOAD_URL = `${BASE_URL}/upload`
  const PREDICT_URL = `${BASE_URL}/call/predict`

  console.log("--- Starting Frontend Food Detection ---")

  try {
    // STEP 1: Upload the file to Gradio (Proper way)
    console.log("Step 1: Uploading file to Gradio server...")
    const uploadFormData = new FormData()
    uploadFormData.append("files", file)

    const uploadResp = await fetch(UPLOAD_URL, {
      method: "POST",
      body: uploadFormData,
    })

    if (!uploadResp.ok) {
      const errorText = await uploadResp.text()
      console.error("Upload failed:", errorText)
      throw new Error(`Failed to upload image to Gradio server: ${uploadResp.statusText}`)
    }

    const uploadedPaths = await uploadResp.json()
    const tempFilePath = uploadedPaths[0]
    console.log("File uploaded. Temp path:", tempFilePath)

    // STEP 2: Initiate Prediction with the temp path
    console.log("Step 2: Initiating prediction job...")
    const payload = {
      data: [
        {
          path: tempFilePath,
          meta: { _type: "gradio.FileData" }
        }
      ]
    }

    const callResp = await fetch(PREDICT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    if (!callResp.ok) {
      const errorText = await callResp.text()
      console.error("Handshake failed:", errorText)
      throw new Error(`Gradio handshake failed: ${callResp.statusText}`)
    }

    const { event_id } = await callResp.json()
    console.log("Job queued. Event ID:", event_id)

    // STEP 3: Listen to Stream for Result
    const resultUrl = `${PREDICT_URL}/${event_id}`
    console.log("Step 3: Listening to stream at", resultUrl)

    // Gradio uses Server-Sent Events (SSE). We'll manually read the stream.
    const response = await fetch(resultUrl)
    if (!response.ok) throw new Error("Streaming connection failed")

    const reader = response.body?.getReader()
    if (!reader) throw new Error("Failed to get stream reader")

    const decoder = new TextDecoder()
    let finalResult: any = null
    let currentEvent: string | null = null

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split("\n")

      for (let line of lines) {
        line = line.trim()
        if (!line) continue

        if (line.startsWith("event:")) {
          currentEvent = line.replace("event:", "").trim()
        } else if (line.startsWith("data:")) {
          const dataStr = line.replace("data:", "").trim()

          if (currentEvent === "complete" || currentEvent === "message") {
            try {
              const dataJson = JSON.parse(dataStr)
              finalResult = Array.isArray(dataJson) ? dataJson[0] : dataJson
              console.log("SUCCESS: Result found:", finalResult)
              break
            } catch (e) {
              finalResult = dataStr
              break
            }
          }

          if (currentEvent === "error") {
            console.error("Gradio STREAM ERROR:", dataStr)
            throw new Error(`Gradio error: ${dataStr}`)
          }
        }
      }

      if (finalResult) break
    }

    if (!finalResult) {
      throw new Error("Model did not return a result in time.")
    }

    // Handle nested object format if necessary (similar to previous fix)
    const label = typeof finalResult === 'object' ? finalResult.label : finalResult

    if (!label) {
      throw new Error("No food label found in prediction")
    }

    return label

  } catch (err) {
    console.error("Food Detection Error:", err)
    throw err
  }
}

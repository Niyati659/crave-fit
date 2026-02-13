from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import requests
import base64
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SPACE_BASE = "https://xyz12343-cravefit-inference.hf.space"


@app.get("/")
def home():
    return {"message": "CraveFit Space Proxy API running 🚀"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    contents = await file.read()
    b64 = base64.b64encode(contents).decode()

    payload = {
        "data": [
            {
                "url": f"data:image/jpeg;base64,{b64}"
            }
        ]
    }

    # Step 1 — Send job
    call_res = requests.post(
        f"{SPACE_BASE}/gradio_api/call/predict",
        json=payload
    ).json()

    event_id = call_res["event_id"]

    # Step 2 — Poll queue
    while True:

        result = requests.get(
            f"{SPACE_BASE}/gradio_api/queue/data",
            params={"event_id": event_id}
        ).json()

        if result["status"] == "COMPLETE":
            return result["output"]["data"][0]

        time.sleep(1)

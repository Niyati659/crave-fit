from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
from PIL import Image
import io

from transformers import AutoImageProcessor, AutoModelForImageClassification
import torch

app = FastAPI()

device = "cuda" if torch.cuda.is_available() else "cpu"
# -------- Global Model --------
global_processor = AutoImageProcessor.from_pretrained(
    "model/cravefit_food_model"   # local path if downloaded
)

global_model = AutoModelForImageClassification.from_pretrained(
    "model/cravefit_food_model"
).to(device)

print("Global model loaded ✅")

# -------- Indian Model --------
indian_processor = AutoImageProcessor.from_pretrained(
    "model/cravefit_indian_model_v2"
)

indian_model = AutoModelForImageClassification.from_pretrained(
    "model/cravefit_indian_model_v2"
).to(device)

print("Indian model loaded ✅")


# ✅ CORS CONFIG
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def predict_food(image: Image.Image):

    image = image.convert("RGB")

    # -------- Global Prediction --------
    inputs = global_processor(
        images=image,
        return_tensors="pt"
    ).to(device)

    with torch.no_grad():
        outputs = global_model(**inputs)

    probs = torch.nn.functional.softmax(
        outputs.logits, dim=1
    )

    global_conf = probs.max().item()
    global_id = probs.argmax().item()
    global_label = global_model.config.id2label[global_id]

    # -------- Indian Prediction --------
    inputs_ind = indian_processor(
        images=image,
        return_tensors="pt"
    ).to(device)

    with torch.no_grad():
        outputs_ind = indian_model(**inputs_ind)

    probs_ind = torch.nn.functional.softmax(
        outputs_ind.logits, dim=1
    )

    indian_conf = probs_ind.max().item()
    indian_id = probs_ind.argmax().item()
    indian_label = indian_model.config.id2label[indian_id]

    # -------- Hybrid Decision --------
    if indian_conf > 0.6:
        return indian_label, indian_conf, "indian_model"

    return global_label, global_conf, "global_model"


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    label, confidence, source = predict_food(image)
    clean_label = label.replace("_", " ")

    return {
        "label": clean_label,
        "confidence": confidence,
        "model_used": source
    }

